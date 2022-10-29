import { taskHandler, ticketHandler } from './afterMutations/cards';
import { IModels } from './connectionResolver';

export default {
  'cards:ticket': ['update'],
  'cards:task': ['update']
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params
) => {
  console.log('afterrrrrrrr');

  if (params.type === 'cards:ticket') {
    await ticketHandler(models, subdomain, params);
  }

  if (params.type === 'cards:task') {
    await taskHandler(models, subdomain, params);
  }

  return;
};
