import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import {
  afterCustomerCreate,
  afterCustomerUpdate
} from './afterMutations/customer';
import { afterDealCreate, afterDealUpdate } from './afterMutations/deals';

export default {
  'cards:deal': ['create', 'update'],
  'contacts:customer': ['create', 'update']
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

  if (type === 'contacts:customer') {
    const xypEnabled = await isEnabled('xyp');

    if (!xypEnabled) {
      return;
    }

    if (action === 'create') {
      await afterCustomerCreate(subdomain, params);
    }

    if (action === 'update') {
      await afterCustomerUpdate(subdomain, params);
    }

    return;
  }
};
