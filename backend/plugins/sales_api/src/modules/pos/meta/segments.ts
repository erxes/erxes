import { SegmentConfigs } from 'erxes-api-shared/core-modules';
import {
  fetchByQueryWithScroll,
  getEsIndexByContentType,
} from 'erxes-api-shared/utils';
import * as _ from 'underscore';
import { posSegmentConfigs } from './posSegmentConfigs';

export const posSegments = {
  contentTypes: posSegmentConfigs.contentTypes,

  associationFilter: async ({ data, subdomain }) => {
    const { mainType, propertyType, positiveQuery, negativeQuery } = data;
    let ids: string[] = [];

    if (mainType.includes('core:contact')) {
      ids = await fetchByQueryWithScroll({
        subdomain,
        index: 'pos_orders',
        _source: 'customerId',
        positiveQuery,
        negativeQuery,
      });
    }

    if (propertyType.includes('core:contact')) {
      const customerIds = await fetchByQueryWithScroll({
        subdomain,
        index: await getEsIndexByContentType(propertyType),
        positiveQuery,
        negativeQuery,
      });

      ids = await fetchByQueryWithScroll({
        subdomain,
        index: 'pos_orders',
        _source: '_id',
        positiveQuery: {
          terms: {
            customerId: customerIds,
          },
        },
        negativeQuery: undefined,
      });
    }

    ids = _.uniq(ids);

    return { data: ids, status: 'success' };
  },

  esTypesMap: async (_data, _context) => {
    return { data: { typesMap: {} }, status: 'success' };
  },
} as SegmentConfigs;
