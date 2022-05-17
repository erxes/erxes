import {
  redis,
  isAvailable,
  getService,
  getServices,
  isEnabled
} from '@erxes/api-utils/src/serviceDiscovery';

const setAfterMutations = async () => {
  const services = await getServices();
  const result = {};

  for (const service of services) {
    const info = await getService(service, true);
    const meta = Object.keys(info.config).includes('meta')
      ? (info.config as any).meta
      : {};

    if (!Object.keys(meta).includes('afterMutations')) {
      continue;
    }

    for (const type of Object.keys(meta.afterMutations)) {
      if (!Object.keys(result).includes(type)) {
        result[type] = {};
      }

      for (const action of meta.afterMutations[type]) {
        if (!Object.keys(result[type]).includes(action)) {
          result[type][action] = [];
        }

        result[type][action].push(service);
      }
    }
  }

  await redis.set('afterMutations', JSON.stringify(result));
};

export const clearCache = async () => {
  await redis.del('enabled_services');
};

export const serviceDiscovery = {
  isAvailable,
  getServices,
  getService,
  redis,
  isEnabled
};

export { isAvailable, getServices, getService, redis, setAfterMutations };
