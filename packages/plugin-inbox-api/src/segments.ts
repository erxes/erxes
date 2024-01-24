import {
  fetchByQuery,
  fetchByQueryWithScroll,
} from '@erxes/api-utils/src/elasticsearch';
import { getEsIndexByContentType } from '@erxes/api-utils/src/segments';
import * as _ from 'underscore';

export default {
  dependentServices: [{ name: 'contacts', twoWay: true }],

  contentTypes: [
    {
      type: 'conversation',
      description: 'Conversation',
      esIndex: 'conversations',
    },
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery },
  }) => {
    let ids: string[] = [];

    if (mainType.includes('contacts')) {
      ids = await fetchByQuery({
        subdomain,
        index: await getEsIndexByContentType(mainType),
        _source: 'customerId',
        positiveQuery,
        negativeQuery,
      });
    }

    if (propertyType.includes('contacts')) {
      const customerIds = await fetchByQueryWithScroll({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery,
      });

      ids = await fetchByQuery({
        subdomain,
        index: 'conversations',
        _source: '_id',
        positiveQuery: customerIds.map((id) => ({
          match: {
            customerId: id,
          },
        })),
        negativeQuery: [],
      });
    }

    ids = _.uniq(ids);

    return { data: ids, status: 'success' };
  },
};
