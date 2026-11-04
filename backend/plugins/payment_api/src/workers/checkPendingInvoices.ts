import { Job, Queue } from 'bullmq';
import {
  createMQWorkerWithListeners,
  getEnv,
  getSaasOrganizationsByFilter,
  graphqlPubsub,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { PAYMENT_STATUS } from '~/constants';
import { splitType } from 'erxes-api-shared/core-modules';

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

const BATCH_LIMIT = 200;

const LOG_PREFIX = 'pendingInvoicesCron';

const log = (msg: string) => process.stdout.write(`[${LOG_PREFIX}] ${msg}\n`);
const logError = (msg: string) =>
  process.stderr.write(`[${LOG_PREFIX}] ${msg}\n`);

const notifyPaidInvoice = async (models: any, subdomain: string, _id: string) => {
  const invoice = await models.Invoices.getInvoice({ _id }, true);

  graphqlPubsub.publish(`invoiceUpdated:${_id}`, {
    invoiceUpdated: { _id, status: PAYMENT_STATUS.PAID },
  });

  // Same notification as the invoicesCheck mutation (the widget's check button)
  if (invoice.contentType) {
    const [pluginName, moduleName, collectionType] = splitType(
      invoice.contentType,
    );

    sendWorkerQueue(pluginName, 'payments')
      .add(
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
      )
      .catch((err) =>
        logError(`Failed to enqueue callback for invoice ${_id}: ${err.message}`),
      );
  }

  if (invoice.callback) {
    fetch(invoice.callback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: invoice._id,
        amount: invoice.amount,
        status: PAYMENT_STATUS.PAID,
      }),
    }).catch((err) =>
      logError(`Callback failed for invoice ${_id}: ${err.message}`),
    );
  }
};

export const checkPendingInvoicesForSubdomain = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const now = Date.now();

  const invoices = await models.Invoices.find(
    {
      status: PAYMENT_STATUS.PENDING,
      createdAt: {
        $gte: new Date(now - MAX_AGE_MS),
        $lte: new Date(now - MIN_AGE_MS),
      },
    },
    { _id: 1 },
  )
    .sort({ createdAt: 1 })
    .limit(BATCH_LIMIT)
    .lean();

  let paidCount = 0;

  for (const { _id } of invoices) {
    try {
      // checkInvoice checks every pending transaction of the invoice with its
      // provider, not only the latest one.
      const status = await models.Invoices.checkInvoice(_id, subdomain);

      if (status === PAYMENT_STATUS.PAID) {
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

const scheduleOrgChecks = async () => {
  if (getEnv({ name: 'VERSION' }) === 'saas') {
    const orgs = await getSaasOrganizationsByFilter({});

    for (const org of orgs) {
      sendWorkerQueue(SERVICE, ORG_QUEUE).add(
        ORG_QUEUE,
        { subdomain: org.subdomain },
        // one pending job per org at a time
        { jobId: `${ORG_QUEUE}-${org.subdomain}` },
      );
    }
  } else {
    sendWorkerQueue(SERVICE, ORG_QUEUE).add(
      ORG_QUEUE,
      { subdomain: 'os' },
      { jobId: `${ORG_QUEUE}-os` },
    );
  }

  return 'scheduled';
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
};
