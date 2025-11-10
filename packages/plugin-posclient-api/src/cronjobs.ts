import { getEnv } from '@erxes/api-utils/src';
import { getOrganizations } from '@erxes/api-utils/src/saas/saas';
import { generateModels } from './connectionResolver';
import { syncRemainders } from './graphql/utils/products';
import { PRODUCT_STATUSES } from './models/definitions/constants';

const runner = async (subdomain) => {
  const models = await generateModels(subdomain);
  const posConfigs = await models.Configs.find({ status: { $ne: 'deleted' }, saveRemainder: true }).lean();
  if (!posConfigs.length) {
    return;
  }

  for (const config of posConfigs) {
    const filter: any = {
      status: { $ne: PRODUCT_STATUSES.DELETED },
      tokens: { $in: [config.token] }
    };

    const products = await models.Products.find({ ...filter }).lean();

    if (!products.length) {
      continue;
    }

    await syncRemainders(subdomain, models, config, products);
    console.log('Fetched remainder per hour at: ', new Date(), ', org: ', subdomain, ', pos: ', config.name);
  }
}

const handleHourlyJob = async ({ subdomain }) => {
  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    const organizations = await getOrganizations();

    for (const org of organizations) {
      if (org.subdomain.length === 0) {
        continue;
      }
      await runner(org.subdomain);
    }
  } else {
    await runner(subdomain)
  }

  return 'done';
};

export default {
  handleHourlyJob,
};
