import * as _ from 'underscore';
import { fetchByQuery } from '@erxes/api-utils/src/elasticsearch';
import { getEsIndexByContentType } from '@erxes/api-utils/src/segments';

export default {
  dependentServices: [
    { name: 'contacts', twoWay: true },
    { name: 'core', twoWay: true }
  ],

  contentTypes: [
    { type: 'feeds', description: 'Exm Feed', esIndex: 'exm_feeds' },
    { type: 'thanks', description: 'Exm Thanks', esIndex: 'exm_thanks' }
  ],

  esTypesMap: async () => {
    return { data: { typesMap: {} }, status: 'success' };
  },

  associationFilter: async ({
    subdomain,
    data: { mainType, propertyType, positiveQuery, negativeQuery }
  }) => {
    let ids: string[] = [];

    if (mainType.includes('core')) {
      ids = await fetchByQuery({
        subdomain,
        index: 'exm_feeds',
        _source: 'createdBy',
        positiveQuery,
        negativeQuery
      });
    }

    if (propertyType.includes('core')) {
      const teamMemberIds = await fetchByQuery({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery
      });

      ids = await fetchByQuery({
        subdomain,
        index: 'exm_feeds',
        _source: '_id',
        positiveQuery: {
          terms: {
            createdBy: teamMemberIds
          }
        },
        negativeQuery: undefined
      });
    }

    ids = _.uniq(ids);

    return { data: ids, status: 'success' };
  }
};
