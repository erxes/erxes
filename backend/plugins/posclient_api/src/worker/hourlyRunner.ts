import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizations,
  sendTRPCMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { PRODUCT_STATUSES } from '~/modules/posclient/db/definitions/constants';
import {
  syncDiscounts,
  syncRemainders,
} from '~/modules/posclient/utils/products';

export const mainScheduler = async () => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const orgs = await getSaasOrganizations();

    for (const org of orgs) {
      if (typeof org.subdomain !== 'string' || !org.subdomain.trim()) {
        console.warn(
          'Skipping POS remainder sync for organization without subdomain',
          {
            organizationId: org._id,
          },
        );
        continue;
      }

      await sendWorkerQueue('posclient', 'sync-remainder').add(
        'sync-remainder',
        {
          subdomain: org.subdomain,
          timezone: org.timezone,
        },
        { removeOnComplete: true, removeOnFail: true },
      );
    }
  } else {
    const timezone = await sendTRPCMessage({
      subdomain: 'os',

      pluginName: 'core',
      method: 'query',
      module: 'configs',
      action: 'getConfig',
      input: {
        code: 'TIMEZONE',
      },
      defaultValue: 'UTC',
    });

    await sendWorkerQueue('posclient', 'sync-remainder').add(
      'sync-remainder',
      {
        subdomain: 'os',
        timezone,
      },
      { removeOnComplete: true, removeOnFail: true },
    );
  }
  return 'success';
};

export const runner = async (
  job: Job<{ subdomain?: string; timezone?: string }>,
) => {
  // Apply cleanup to jobs already queued with the previous retention settings.
  job.opts.removeOnComplete = true;
  job.opts.removeOnFail = true;
  const { subdomain } = job.data ?? {};

  if (typeof subdomain !== 'string' || !subdomain.trim()) {
    console.warn('Skipping POS remainder sync job without subdomain', {
      jobId: job.id,
      jobName: job.name,
      repeatJobKey: job.repeatJobKey,
    });
    return { skipped: true, reason: 'missing-subdomain' };
  }

  const models = await generateModels(subdomain);

  const posConfigs = await models.Configs.find({
    status: { $ne: 'deleted' },
    saveRemainder: true,
  }).lean();
  if (!posConfigs.length) {
    return;
  }

  for (const config of posConfigs) {
    const filter = {
      status: { $ne: PRODUCT_STATUSES.DELETED },
      tokens: { $in: [config.token] },
    };

    const products = await models.Products.find({ ...filter }).lean();

    if (!products.length) {
      continue;
    }

    await syncRemainders(subdomain, models, config, products);
    await syncDiscounts(subdomain, models, products);
  }
};
