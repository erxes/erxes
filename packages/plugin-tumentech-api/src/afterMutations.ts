import { afterDealCreate, afterDealUpdate } from './afterMutations/deals';

export default {
  'cards:deal': ['create', 'update'],
  'contacts:customer': ['create']
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

  if (type === 'contacts:customer' && action === 'create') {
    console.log('PARAMS', params);
    return;
  }
};
