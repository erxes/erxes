import { Segments } from '../../../db/models';
import { fetchElk } from '../../../elasticsearch';
import { fetchBySegments } from '../../modules/segments/queryBuilder';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const segmentQueries = {
  /**
   * Segments list
   */
  segments(_root, { contentType }: { contentType: string }, { commonQuerySelector }: IContext) {
    return Segments.find({ ...commonQuerySelector, contentType }).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  async segmentsGetHeads(_root, _args, { commonQuerySelector }: IContext) {
    return Segments.find({ ...commonQuerySelector, $or: [{ subOf: { $exists: false } }, { subOf: '' }] });
  },

  /**
   * Get one segment
   */
  segmentDetail(_root, { _id }: { _id: string }) {
    return Segments.findOne({ _id });
  },

  /**
   * Return event names with attribute names
   */
  async segmentsEvents(_root, { contentType }: { contentType: string }) {
    const aggs = {
      names: {
        terms: {
          field: 'name',
        },
      },
    };

    const query = {
      exists: {
        field: contentType === 'customer' ? 'customerId' : 'companyId',
      },
    };

    const aggreEvents = await fetchElk('search', 'events', {
      aggs,
      query,
      size: 0,
    });

    const aggreHits = await fetchElk('search', 'events', {
      aggs,
      query,
      size: aggreEvents.aggregations.names.buckets.length,
    });

    const events = aggreHits.hits.hits.map(hit => ({
      name: hit._source.name,
      attributeNames: Object.keys(hit._source.attributes),
    }));

    return events;
  },

  /**
   * Preview count
   */
  async segmentsPreviewCount(_root, { contentType, conditions }: { contentType: string; conditions }) {
    const { positiveList, negativeList } = await fetchBySegments(
      { name: 'preview', color: '#fff', subOf: '', contentType, conditions },
      'count',
    );

    const response = await fetchElk('count', contentType === 'customer' ? 'customers' : 'companies', {
      query: {
        bool: {
          must: positiveList,
          must_not: negativeList,
        },
      },
    });

    return response.count;
  },
};

requireLogin(segmentQueries, 'segmentsGetHeads');
requireLogin(segmentQueries, 'segmentDetail');
requireLogin(segmentQueries, 'segmentsPreviewCount');
requireLogin(segmentQueries, 'segmentsEvents');

checkPermission(segmentQueries, 'segments', 'showSegments', []);

export default segmentQueries;
