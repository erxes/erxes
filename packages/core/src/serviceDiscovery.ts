const enabledServices = require('../enabled-services');
import { redis, join, leave, getServices, getService } from '@erxes/api-utils/src/serviceDiscovery'

export async function refreshEnabledServicesCache() {
  await redis.del('erxes:plugins:enabled');

  for (const serviceName in enabledServices) {
    if (!enabledServices[serviceName]) {
      continue;
    }
    await redis.sadd('erxes:plugins:enabled', serviceName);
  }

  const members = await redis.smembers('erxes:plugins:enabled');
  console.log(`Enabled plugins: ${members}`);
}

export {
  redis,
  getServices,
  getService,
  join,
  leave
}