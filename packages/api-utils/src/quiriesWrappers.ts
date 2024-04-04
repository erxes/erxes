import * as _ from 'underscore';
import redis from './redis';
import { sendRPCMessage } from '@erxes/api-utils/src/messageBroker';

export const afterQueryWrapper = async (
  subdomain,
  queryName,
  args,
  results,
  user,
) => {
  const value = await redis.get('afterQueries');

  const afterQueries = JSON.parse(value || '{}');

  if (!afterQueries[queryName] || !afterQueries[queryName].length) {
    return results;
  }

  for (const service of afterQueries[queryName]) {
    try {
      const perResults = await sendRPCMessage(`${service}:afterQuery`, {
        subdomain,
        data: {
          queryName,
          args,
          results,
          user,
        },
      });
      if (perResults) {
        results = perResults;
      }
    } catch (e) {
      console.log(`afterQueries error: ${e}`);
      return results;
    }
  }

  return results;
};
