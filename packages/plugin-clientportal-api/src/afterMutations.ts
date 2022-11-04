import { cardUpdateHandler, cardDeleteHandler } from './afterMutations/cards';
import { kbHandler } from './afterMutations/knowledgeBase';
import { IModels } from './connectionResolver';

export default {
  'cards:ticket': ['update', 'delete'],
  'cards:task': ['update', 'delete'],
  'knowledgebase:knowledgeBaseArticle': ['create', 'update']
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params
) => {
  if (
    ['cards:task', 'cards:ticket'].includes(params.type) &&
    params.action === 'update'
  ) {
    await cardUpdateHandler(models, subdomain, params);
  }

  if (
    ['cards:task', 'cards:ticket'].includes(params.type) &&
    params.action === 'delete'
  ) {
    await cardDeleteHandler(models, subdomain, params);
  }

  if (params.type === 'knowledgebase:knowledgeBaseArticle') {
    await kbHandler(models, subdomain, params);
  }

  return;
};
