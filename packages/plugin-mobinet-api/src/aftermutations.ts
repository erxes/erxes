import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

import { afterTicketRemove } from './aftermutations/tickets';

export default {
  'cards:ticket': ['create', 'update', 'delete'],
  //   'contacts:customer': ['create', 'update']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === 'cards:ticket') {
    if (action === 'delete') {
      await afterTicketRemove(subdomain, params);
    }
  }
};
