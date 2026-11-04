import { Job, Queue } from 'bullmq';
import {
  createMQWorkerWithListeners,
  getEnv,
  getSaasOrganizationsByFilter,
  graphqlPubsub,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { splitType } from 'erxes-api-shared/core-modules';
import { generateModels, IModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import {
  enqueueInvoiceCallback,
  INVOICE_CALLBACK_QUEUE,
  sendInvoiceCallback,
} from '~/modules/payment/services/invoiceCallbackQueue';

const SERVICE = 'payment';
const SCHEDULER_QUEUE = 'pending-invoices-schedule';
const ORG_QUEUE = 'pending-invoices-check';

// Every 5 minutes.
const SCHEDULE_PATTERN = '*/5 * * * *';

// Only look at invoices created in this window. Younger invoices are still
// being handled by the live widget (polling + provider callback). Older ones
// are left alone so we never touch orders that were settled by other means.
const MIN_AGE_MS = 2 * 60 * 1000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Max invoices checked per org per run. Runs continue from where the previous
// run stopped (see cursor below), so every eligible invoice gets its turn.
const BATCH_LIMIT = 200;

const LOG_PREFIX = 'pendingInvoicesCron';

const log = (msg: string) => process.stdout.write(`[${LOG_PREFIX}] ${msg}\n`);
const logError = (msg: string) =>
  process.stderr.write(`[${LOG_PREFIX}] ${msg}\n`);

const cursorKey = (subdomain: string) =>
  `payment:pendingInvoicesCursor:${subdomain}`;

const notifyPaidInvoice = async (
  models: IModels,
  subdomain: string,
  _id: string,
) => {
  const invoice = await models.Invoices.getInvoice({ _id }, true);

  graphqlPubsub.publish(`invoiceUpdated:${_id}`, {
    invoiceUpdated: { _id, status: PAYMENT_STATUS.PAID },
  });

  // The plugin callback and the external callback are attempted
  // independently, so one failing to enqueue does not cancel the other.
  let firstError: unknown;

  // Same notification as the invoicesCheck mutation (the widget's check button)
  if (invoice.contentType) {
    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );

    try {
      await sendWorkerQueue(pluginName, 'payments').add(
        'callback',
        {
          subdomain,
          data: {
            ...invoice,
            status: PAYMENT_STATUS.PAID,
            moduleName,
            collectionType,
            apiResponse: 'success',
          },
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
      );
    } catch (e) {
      firstError = firstError || e;
    }
  }

  try {
    await enqueueInvoiceCallback(invoice);
  } catch (e) {
    firstError = firstError || e;
  }

  if (firstError) {
    throw firstError;
  }
};

export const checkPendingInvoicesForSubdomain = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const now = Date.now();

  const filter: any = {
    status: PAYMENT_STATUS.PENDING,
    createdAt: {
      $gte: new Date(now - MAX_AGE_MS),
      $lte: new Date(now - MIN_AGE_MS),
    },
  };

  // Continue after the last invoice checked in the previous run, so the same
  // oldest invoices cannot starve newer ones.
  const savedCursor = await redis.get(cursorKey(subdomain));

  if (savedCursor) {
    const { createdAt, _id } = JSON.parse(savedCursor);
    const cursorDate = new Date(createdAt);

    filter.$or = [
      { createdAt: { $gt: cursorDate } },
      { createdAt: cursorDate, _id: { $gt: _id } },
    ];
  }

  const invoices = await models.Invoices.find(filter, { _id: 1, createdAt: 1 })
    .sort({ createdAt: 1, _id: 1 })
    .limit(BATCH_LIMIT)
    .lean();

  if (invoices.length < BATCH_LIMIT) {
    // reached the end, next run starts from the oldest again
    await redis.del(cursorKey(subdomain));
  } else {
    const last = invoices[invoices.length - 1];

    await redis.set(
      cursorKey(subdomain),
      JSON.stringify({ createdAt: last.createdAt, _id: last._id }),
      'EX',
      Math.ceil(MAX_AGE_MS / 1000),
    );
  }

  let paidCount = 0;

  for (const { _id } of invoices) {
    try {
      // checks every pending transaction of the invoice with its provider
      const { status, claimed } = await models.Invoices.checkInvoiceAndClaim(
        _id,
        subdomain,
      );

      // Notify only if this check moved the invoice to paid. If another check
      // (widget, provider callback) got there first, it already notified.
      if (status === PAYMENT_STATUS.PAID && claimed) {
        paidCount++;
        log(`${subdomain}: invoice ${_id} found paid, notifying`);
        await notifyPaidInvoice(models, subdomain, _id);
      }
    } catch (e) {
      logError(`${subdomain}: failed to check invoice ${_id}: ${e.message}`);
    }
  }

  return { checked: invoices.length, paid: paidCount };
};

const addOrgCheck = (subdomain: string) =>
  sendWorkerQueue(SERVICE, ORG_QUEUE).add(
    ORG_QUEUE,
    { subdomain },
    {
      // Fixed id: at most one waiting/active check per org. Completed and failed
      // jobs are removed right away so the id is free for the next run.
      jobId: `${ORG_QUEUE}-${subdomain}`,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

const scheduleOrgChecks = async () => {
  const subdomains =
    getEnv({ name: 'VERSION' }) === 'saas'
      ? (await getSaasOrganizationsByFilter({})).map((org) => org.subdomain)
      : ['os'];

  const results = await Promise.allSettled(subdomains.map(addOrgCheck));

  const failed = results.filter((r) => r.status === 'rejected');

  if (failed.length) {
    // fail the scheduler job so it shows up in logs instead of silently passing
    throw new Error(
      `Failed to queue ${failed.length}/${subdomains.length} org checks: ${
        (failed[0] as PromiseRejectedResult).reason?.message
      }`,
    );
  }

  return `scheduled ${subdomains.length}`;
};

const checkOrg = async (job: Job) => {
  const { subdomain } = job.data || {};

  if (!subdomain) {
    return;
  }

  return checkPendingInvoicesForSubdomain(subdomain);
};

export const initPendingInvoicesWorker = async () => {
  const schedulerQueue = new Queue(`${SERVICE}-${SCHEDULER_QUEUE}`, {
    connection: redis,
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
  });

  await schedulerQueue.upsertJobScheduler(
    SCHEDULER_QUEUE,
    { pattern: SCHEDULE_PATTERN, tz: 'UTC' },
    { name: SCHEDULER_QUEUE },
  );

  createMQWorkerWithListeners(
    SERVICE,
    SCHEDULER_QUEUE,
    scheduleOrgChecks,
    redis,
    () => log('scheduler worker ready'),
  );

  createMQWorkerWithListeners(
    SERVICE,
    ORG_QUEUE,
    checkOrg,
    redis,
    () => log('org check worker ready'),
    { concurrency: 5 },
  );

  createMQWorkerWithListeners(
    SERVICE,
    INVOICE_CALLBACK_QUEUE,
    sendInvoiceCallback,
    redis,
    () => log('invoice callback worker ready'),
  );
};
