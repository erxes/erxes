import redis from '@erxes/api-utils/src/redis';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';

export const otherPlugins = async (subdomain, doc) => {
  const value = await redis.get('afterMutations');
  const afterMutations = JSON.parse(value || '{}');

  if (afterMutations['burenscoring:burenscoring']?.['create']?.length) {
    for (const service of afterMutations['burenscoring:burenscoring'][
      'create'
    ]) {
      await sendMessage(`${service}:afterMutation`, {
        subdomain,
        data: {
          type: 'burenscoring:burenscoring',
          action: 'create',
          object: doc,
        },
      });
    }
  }
};
