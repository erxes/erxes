import { afterDealCreate, afterDealUpdate } from './afterMutations/deals';

export default {
  'cards:deal': ['create', 'update'],
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === 'cards:deal') {
    if (action === 'create') {
      await afterDealCreate(subdomain, params);
    }

    if (action === 'update') {
      await afterDealUpdate(subdomain, params);
    }
    return;
  }
  
};
