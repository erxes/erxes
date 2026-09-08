import { getEnv } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { IMailCloudflareDocument } from '@/integrations/mail/@types/cloudflare';
import {
  MAIL_OPTIONAL_PROVISION_STEPS,
  MAIL_PROVISION_STEPS,
  MAIL_RETENTION_DAYS,
} from '@/integrations/mail/constants';
import {
  CloudflareError,
  describeCloudflareError,
} from '@/integrations/mail/utils/cloudflare/client';
import {
  attachQueueConsumer,
  createBucket,
  createSendingSubdomain,
  getScriptSettings,
  getSendingDns,
  listSendingSubdomains,
  listQueueConsumers,
  createQueue,
  enableEmailRouting,
  enableWorkersDev,
  getEmailRouting,
  getWorkersSubdomain,
  getZone,
  listQueues,
  putBucketLifecycle,
  putCatchAllRule,
  putScriptSecret,
  uploadScript,
  verifyToken,
} from '@/integrations/mail/utils/cloudflare/api';
import {
  buildScriptMetadata,
  workerScript,
  workerScriptVersion,
} from '@/integrations/mail/utils/cloudflare/worker';
import { forgetCloudflareCache } from '@/integrations/mail/utils/cloudflare/connection';
import {
  foreignMailHost,
  foreignMailReason,
  inactiveZoneReason,
} from '@/integrations/mail/utils/cloudflare/zones';

type TProvisionStep = (typeof MAIL_PROVISION_STEPS)[number];

interface IProvisionContext {
  subdomain: string;
  connection: IMailCloudflareDocument;
  accountId: string;
  workerOrigin: string;
  queueIds: Record<string, string>;
  sendingTag: string;
  sendingEnabled: boolean;
}

const isOptionalStep = (step: TProvisionStep) =>
  (MAIL_OPTIONAL_PROVISION_STEPS as readonly string[]).includes(step);

const PERMISSION_HINTS: Record<TProvisionStep, string> = {
  verifyToken: 'the token itself',
  resolveAccount: 'Account · Workers Scripts · Edit',
  checkZone: 'Zone · Zone · Read and Zone · DNS · Read',
  enableEmailRouting:
    'Zone · Email Routing Rules · Edit, Zone · Zone Settings · Edit and Zone · DNS · Edit — or enable Email Routing once in the Cloudflare dashboard and run this again',
  ensureBucket: 'Account · Workers R2 Storage · Edit',
  ensureLifecycle: 'Account · Workers R2 Storage · Edit',
  ensureQueues:
    'Account · Queues · Edit, and a Workers Paid plan — queues are not on the free plan',
  uploadScript: 'Account · Workers Scripts · Edit',
  putSecret: 'Account · Workers Scripts · Edit',
  enableWorkersDev: 'Account · Workers Scripts · Edit',
  attachConsumer: 'Account · Queues · Edit',
  setCatchAll: 'Zone · Email Routing Rules · Edit',
  enableEmailSending:
    'a Workers Paid plan — Email Sending is not on the free plan — plus Account · Email Sending · Edit and Zone · DNS · Edit. Activating the plan and onboarding this domain once under Compute & AI · Email Service · Email Sending, then running this again, is the usual fix',
  checkSendingDns:
    'a Workers Paid plan and Account · Email Sending · Edit. Activating the plan and onboarding this domain once under Compute & AI · Email Service · Email Sending, then running this again, is the usual fix',
};

const isAuthFailure = (error: unknown) =>
  error instanceof CloudflareError &&
  (error.code === 10000 || error.status === 401 || error.status === 403);

const explainFailure = (step: TProvisionStep, error: unknown) => {
  const described = describeCloudflareError(error);

  if (isAuthFailure(error)) {
    return `${described} — this token is missing ${PERMISSION_HINTS[step]}`;
  }

  return described;
};

const deployedTenant = async (context: IProvisionContext) => {
  const settings = await getScriptSettings(
    context.connection.apiToken,
    context.accountId,
    context.connection.workerName,
  ).catch(() => null);

  const binding = (settings?.bindings ?? []).find(
    (entry) => entry.name === 'DEFAULT_TENANT',
  );

  return (binding?.text ?? '').trim();
};

const ALREADY_THERE =
  /already exists|already taken|already been taken|already has a consumer|duplicate/i;

const withoutTrailingSlash = (value: string) =>
  value.trim().replace(/^([\s\S]*[^/])?\/*$/, '$1');

const mailReceiveUrl = (subdomain: string) => {
  const configured = withoutTrailingSlash(
    getEnv({ name: 'MAIL_RECEIVE_URL', defaultValue: '', subdomain }),
  );

  if (configured) {
    return configured;
  }

  const domain = withoutTrailingSlash(getEnv({ name: 'DOMAIN', subdomain }));

  const base =
    process.env.NODE_ENV === 'production'
      ? `${domain}/gateway/pl:frontline`
      : `${domain}/pl:frontline`;

  return `${base}/mail/receive`;
};

const tolerateExisting = async (run: () => Promise<unknown>) => {
  try {
    await run();
  } catch (e) {
    if (!ALREADY_THERE.test(describeCloudflareError(e))) {
      throw e;
    }
  }
};

const ensureQueueId = async (context: IProvisionContext, queueName: string) => {
  const { connection, accountId } = context;
  const queues = await listQueues(connection.apiToken, accountId);
  const existing = (queues ?? []).find(
    (queue) => queue.queue_name === queueName,
  );

  if (existing) {
    return existing.queue_id;
  }

  const created = await createQueue(connection.apiToken, accountId, queueName);

  return created.queue_id;
};

const STEP_RUNNERS: Record<
  TProvisionStep,
  (context: IProvisionContext) => Promise<void>
> = {
  async verifyToken(context) {
    const result = await verifyToken(context.connection.apiToken);

    if (result?.status && result.status !== 'active') {
      throw new Error(`This API token is ${result.status}, not active`);
    }
  },

  async resolveAccount(context) {
    const { connection } = context;

    if (!connection.accountId) {
      throw new Error(
        'This token cannot reach the account the selected domain belongs to',
      );
    }

    context.accountId = connection.accountId;

    const { subdomain } = await getWorkersSubdomain(
      connection.apiToken,
      connection.accountId,
    );

    if (!subdomain) {
      throw new Error(
        'This account has no workers.dev subdomain yet — register one in the Cloudflare dashboard under Workers, then try again',
      );
    }

    context.workerOrigin = `https://${connection.workerName}.${subdomain}.workers.dev`;
  },

  async checkZone(context) {
    const { connection } = context;
    const zone = await getZone(connection.apiToken, connection.zoneId);

    const inactive = inactiveZoneReason(zone.name, zone.status);

    if (inactive) {
      throw new Error(inactive);
    }

    const inUse = await foreignMailHost(
      connection.apiToken,
      connection.zoneId,
      zone.name,
    );

    if (inUse) {
      throw new Error(foreignMailReason(zone.name, inUse));
    }
  },

  async enableEmailRouting(context) {
    const { connection } = context;

    const read = async () =>
      await getEmailRouting(connection.apiToken, connection.zoneId).catch(
        () => null,
      );

    if ((await read())?.enabled) {
      return;
    }

    try {
      await enableEmailRouting(connection.apiToken, connection.zoneId);
    } catch (e) {
      if ((await read())?.enabled) {
        return;
      }

      throw e;
    }
  },

  async ensureBucket(context) {
    await tolerateExisting(() =>
      createBucket(
        context.connection.apiToken,
        context.accountId,
        context.connection.bucketName,
      ),
    );
  },

  async ensureLifecycle(context) {
    await putBucketLifecycle(
      context.connection.apiToken,
      context.accountId,
      context.connection.bucketName,
      MAIL_RETENTION_DAYS,
    );
  },

  async ensureQueues(context) {
    context.queueIds[context.connection.queueName] = await ensureQueueId(
      context,
      context.connection.queueName,
    );
    context.queueIds[context.connection.dlqName] = await ensureQueueId(
      context,
      context.connection.dlqName,
    );
  },

  async uploadScript(context) {
    const { connection } = context;

    const serving = await deployedTenant(context);

    if (serving && serving !== connection.tenant) {
      throw new Error(
        `The worker ${connection.workerName} on this Cloudflare account already serves the workspace "${serving}". A worker carries a single endpoint and a single signing key, so taking it over would silently stop mail reaching "${serving}". Disconnect that workspace first, or connect this one under a different tenant name`,
      );
    }

    await uploadScript(
      connection.apiToken,
      context.accountId,
      connection.workerName,
      workerScript(),
      buildScriptMetadata({
        endpoint: mailReceiveUrl(context.subdomain),
        tenant: connection.tenant,
        workerOrigin: context.workerOrigin,
        bucketName: connection.bucketName,
        queueName: connection.queueName,
        dlqName: connection.dlqName,
      }),
    );
  },

  async putSecret(context) {
    const { connection } = context;

    await putScriptSecret(
      connection.apiToken,
      context.accountId,
      connection.workerName,
      'WEBHOOK_SECRET',
      connection.webhookSecret,
    );
  },

  async enableWorkersDev(context) {
    await enableWorkersDev(
      context.connection.apiToken,
      context.accountId,
      context.connection.workerName,
    );
  },

  async attachConsumer(context) {
    const { connection } = context;
    const queueId = context.queueIds[connection.queueName];

    const consumers = await listQueueConsumers(
      connection.apiToken,
      context.accountId,
      queueId,
    ).catch(() => []);

    const scriptOf = (consumer: { script_name?: string; script?: string }) =>
      consumer.script_name ?? consumer.script ?? '';

    if ((consumers ?? []).some((c) => scriptOf(c) === connection.workerName)) {
      return;
    }

    const owner = (consumers ?? []).map(scriptOf).filter(Boolean);

    if (owner.length) {
      throw new Error(
        `The queue ${connection.queueName} on this Cloudflare account is already read by ${owner.join(
          ', ',
        )}. A queue accepts a single consumer, so this workspace cannot share it: disconnect the workspace that owns it, or detach that consumer first`,
      );
    }

    await attachQueueConsumer(
      connection.apiToken,
      context.accountId,
      queueId,
      connection.workerName,
      connection.dlqName,
    );
  },

  async setCatchAll(context) {
    const { connection } = context;

    await putCatchAllRule(
      connection.apiToken,
      connection.zoneId,
      connection.workerName,
    );
  },

  async enableEmailSending(context) {
    const { connection } = context;

    const onboarded = await listSendingSubdomains(
      connection.apiToken,
      connection.zoneId,
    );

    const existing = (onboarded ?? []).find(
      (subdomain) => subdomain.name === connection.zoneName,
    );

    const tag =
      existing?.tag ??
      (
        await createSendingSubdomain(
          connection.apiToken,
          connection.zoneId,
          connection.zoneName,
        )
      )?.tag;

    if (!tag) {
      throw new Error(
        `Cloudflare onboarded ${connection.zoneName} for sending but returned no tag`,
      );
    }

    context.sendingTag = tag;
  },

  async checkSendingDns(context) {
    const { connection } = context;

    if (!context.sendingTag) {
      throw new Error(
        `${connection.zoneName} is not onboarded for sending yet — the previous step has to succeed first`,
      );
    }

    const records = await getSendingDns(
      connection.apiToken,
      connection.zoneId,
      context.sendingTag,
    );

    if (!(records ?? []).length) {
      throw new Error(
        'Cloudflare has not written the sending DNS records for this domain yet — run this again in a few minutes',
      );
    }

    context.sendingEnabled = true;
  },
};

export const provisionCloudflare = async (subdomain: string) => {
  const models = await generateModels(subdomain);
  const connection = await models.MailCloudflare.currentOrThrow();

  const context: IProvisionContext = {
    subdomain,
    connection,
    accountId: connection.accountId,
    workerOrigin: connection.workerOrigin ?? '',
    queueIds: {},
    sendingTag: connection.sendingTag ?? '',
    sendingEnabled: false,
  };

  for (const step of MAIL_PROVISION_STEPS) {
    try {
      await STEP_RUNNERS[step](context);
      await models.MailCloudflare.markStep(step, 'ok');
    } catch (e) {
      const message = explainFailure(step, e);

      await models.MailCloudflare.markStep(step, 'failed', message);

      if (isOptionalStep(step)) {
        continue;
      }

      await forgetCloudflareCache(subdomain);

      return await models.MailCloudflare.markFailed(message);
    }
  }

  await forgetCloudflareCache(subdomain);

  return await models.MailCloudflare.markConnected({
    accountId: context.accountId,
    workerOrigin: context.workerOrigin,
    sendingEnabled: context.sendingEnabled,
    sendingTag: context.sendingTag,
    scriptVersion: workerScriptVersion(),
  });
};
