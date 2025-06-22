import { fetchByQuery } from '@erxes/api-utils/src/elasticsearch';

export default {
  dependentServices: [
    {
      name: 'core',
      twoWay: true,
    },
  ],
  contentTypes: [
    {
      type: 'voucher',
      description: 'Voucher',
      esIndex: 'vouchers',
      hideInSidebar: true,
    },
  ],
  associationFilter: async ({
    subdomain,
    data: { positiveQuery, negativeQuery },
  }) => {
    const ids = await fetchByQuery({
      subdomain,
      index: 'vouchers',
      _source: 'ownerId',
      positiveQuery,
      negativeQuery,
    });

    return { data: ids, status: 'success' };
  },
};
