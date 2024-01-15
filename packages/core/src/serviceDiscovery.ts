import {
  join,
  leave,
  getServices,
  getService,
  isEnabled,
  isAvailable,
} from '@erxes/api-utils/src/serviceDiscovery';
import redis from '@erxes/api-utils/src/redis';

export { redis, getServices, getService, join, leave, isEnabled, isAvailable };
