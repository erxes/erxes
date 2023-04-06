import * as dotenv from 'dotenv';
dotenv.config();
import redis from './redis';

const { ENABLED_SERVICES_PATH } = process.env;

if (!ENABLED_SERVICES_PATH) {
  throw new Error(
    'ENABLED_SERVICES_PATH environment variable is not configured.'
  );
}

export async function isServiceEnabled(name: string): Promise<boolean> {
  const serviceCount = await redis.scard('enabled_services');
  console.log({ serviceCount });

  if (serviceCount <= 0) {
    if (!ENABLED_SERVICES_PATH) {
      throw new Error(
        'ENABLED_SERVICES_PATH environment variable is not configured.'
      );
    }
    delete require.cache[require.resolve(ENABLED_SERVICES_PATH)];
    const enabledServices: string[] = require(ENABLED_SERVICES_PATH);
    console.log({ enabledServices });
    await redis.sadd('enabled_services', enabledServices);
  }

  return !!(await redis.sismember('enabled_services', name));
}
