import redis from './redis';

const key = 'socketlabs_mail_domains';

const getDomains = async () => {
  return await redis.smembers(key);
};

const insertDomain = async (domain: string) => {
  await redis.sadd(key, domain);
};

const removeDomain = async (domain: string) => {
  await redis.srem(key, domain);
};

export default {
  getDomains,
  insertDomain,
  removeDomain,
};
