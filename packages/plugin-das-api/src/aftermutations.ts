import { getCustomer, getToken } from './api/utils';

export default {
  'contacts:customer': ['create', 'update', 'remove']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  console.log(params);

  const customer = params.doc;

  const orchardCustomer = await getCustomer(subdomain, customer.primaryPhone);

  if (type === 'contacts:customer') {
    if (action === 'create') {
      // await afterCustomerCreate(subdomain, params);
      console.log('create');

      if (orchardCustomer) {
        // api-ruu update huselt ilgeene
      } else {
        // create hiih huselt ilgeene
      }
    }

    if (action === 'update') {
      // await afterCustomerUpdate(subdomain, params);
      if (orchardCustomer) {
        // api-ruu update huselt ilgeene
      } else {
        // create hiih huselt ilgeene
      }
    }

    if (action === 'remove') {
      // await afterCustomerRemove(subdomain, params);
      console.log('remove');
    }
    return;
  }
};
