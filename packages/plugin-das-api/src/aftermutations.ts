import { getToken } from './api/utils';

export default {
  'contacts:customer': ['create', 'update', 'remove']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === 'contacts:customer') {
    if (action === 'create') {
      // await afterCustomerCreate(subdomain, params);
      console.log('create');
    }

    if (action === 'update') {
      // await afterCustomerUpdate(subdomain, params);
      console.log('update');
      await getToken(subdomain);
    }

    if (action === 'remove') {
      // await afterCustomerRemove(subdomain, params);
      console.log('remove');
    }
    return;
  }
};
