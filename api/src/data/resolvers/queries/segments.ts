import { Segments } from '../../../db/models';
import { fetchElk } from '../../../elasticsearch';
import { fetchBySegments } from '../../modules/segments/queryBuilder';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const segmentQueries = {
  /**
   * Segments list
   */
  segments(
    _root,
    { contentTypes }: { contentTypes: string[] },
    { commonQuerySelector }: IContext
  ) {
    return Segments.find({
      ...commonQuerySelector,
      contentType: { $in: contentTypes }
    }).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  async segmentsGetHeads(_root, _args, { commonQuerySelector }: IContext) {
    return Segments.find({
      ...commonQuerySelector,
      $or: [{ subOf: { $exists: false } }, { subOf: '' }]
    });
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
          field: 'name'
        },
        aggs: {
          hits: {
            top_hits: {
              _source: ['attributes'],
              size: 1
            }
          }
        }
      }
    };

    const query = {
      exists: {
        field: contentType === 'customer' ? 'customerId' : 'companyId'
      }
    };

    const aggreEvents = await fetchElk('search', 'events', {
      aggs,
      query
    });

    const buckets = aggreEvents.aggregations.names.buckets || [];

    const events = buckets.map(bucket => {
      const [hit] = bucket.hits.hits.hits;

      return {
        name: bucket.key,
        attributeNames: hit._source.attributes.map(attr => attr.field)
      };
    });

    return events;
  },

  /**
   * Preview count
   */
  async segmentsPreviewCount(
    _root,
    {
      contentType,
      conditions,
      subOf
    }: { contentType: string; conditions; subOf?: string }
  ) {
    const { positiveList, negativeList } = await fetchBySegments(
      {
        name: 'preview',
        color: '#fff',
        subOf: subOf || '',
        contentType,
        conditions
      },
      'count'
    );

    try {
      const response = await fetchElk(
        'count',
        contentType === 'company' ? 'companies' : 'customers',
        {
          query: {
            bool: {
              must: positiveList,
              must_not: negativeList
            }
          }
        }
      );

      return response.count;
    } catch (e) {
      return 0;
    }
  }
};

requireLogin(segmentQueries, 'segmentsGetHeads');
requireLogin(segmentQueries, 'segmentDetail');
requireLogin(segmentQueries, 'segmentsPreviewCount');
requireLogin(segmentQueries, 'segmentsEvents');

checkPermission(segmentQueries, 'segments', 'showSegments', []);

export default segmentQueries;
