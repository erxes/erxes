import { Job } from 'bullmq';
import {
  getEnv,
  getSaasOrganizations,
  sendTRPCMessage,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { tz } from 'moment-timezone';
import { generateModels } from '~/connectionResolvers';
import { PRODUCT_STATUSES } from '~/modules/posclient/db/definitions/constants';
import { syncRemainders } from '~/modules/posclient/utils/products';

export const mainScheduler = async () => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const orgs = await getSaasOrganizations();

    for (const org of orgs) {
      sendWorkerQueue('posclient', 'synch-remainder').add('synch-remainder', {
        subdomain: org.subdomain,
        timezone: org.timezone,
      });
    }

    return 'success';
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

    sendWorkerQueue('posclient', 'synch-remainder').add('synch-remainder', {
      subdomain: 'os',
      timezone,
    });
    return 'success';
  }
};

export const runner = async (job: Job) => {
  const { subdomain, timezone = 'UTC' } = job?.data ?? {};

  const models = await generateModels(subdomain);

  const posConfigs = await models.Configs.find({
    status: { $ne: 'deleted' },
    saveRemainder: true,
  }).lean();
  if (!posConfigs.length) {
    return;
  }

  for (const config of posConfigs) {
    const filter: any = {
      status: { $ne: PRODUCT_STATUSES.DELETED },
      tokens: { $in: [config.token] },
    };

    const products = await models.Products.find({ ...filter }).lean();

    if (!products.length) {
      continue;
    }

    await syncRemainders(subdomain, models, config, products);
    console.log(
      'Fetched remainder per hour at: ',
      new Date(),
      ', org: ',
      subdomain,
      ', pos: ',
      config.name,
    );
  }
};
