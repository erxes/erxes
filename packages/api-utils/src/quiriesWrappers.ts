import * as _ from 'underscore';
import redis from './redis';

export const afterQueryWrapper = async (
  subdomain,
  queryName,
  args,
  results,
  messageBroker,
  user
) => {
  const value = await redis.get('afterQueries');

  const afterQueries = JSON.parse(value || '{}');

  if (!afterQueries[queryName] || !afterQueries[queryName].length) {
    return results;
  }

  for (const service of afterQueries[queryName]) {
    results = await messageBroker.sendRPCMessage(`${service}:afterQuery`, {
      subdomain,
      data: {
        queryName,
        args,
        results,
        user
      }
    });
  }

  return results;
};
