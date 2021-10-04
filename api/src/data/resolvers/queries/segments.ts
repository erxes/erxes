import { Segments } from '../../../db/models';
import { fetchElk } from '../../../elasticsearch';
import { fetchSegment } from '../../modules/segments/queryBuilder';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const segmentQueries = {
  /**
   * Segments list
   */
  segments(
    _root,
    {
      contentTypes,
      boardId,
      pipelineId
    }: { contentTypes: string[]; boardId?: string; pipelineId?: string },
    { commonQuerySelector }: IContext
  ) {
    const selector: any = {
      ...commonQuerySelector,
      contentType: { $in: contentTypes },
      name: { $exists: true }
    };

    if (boardId) {
      selector.boardId = boardId;
    }

    if (pipelineId) {
      selector.pipelineId = pipelineId;
    }

    return Segments.find(selector).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  async segmentsGetHeads(_root, _args, { commonQuerySelector }: IContext) {
    return Segments.find({
      ...commonQuerySelector,
      name: { $exists: true },
      $or: [{ subOf: { $exists: false } }, { subOf: '' }]
    });
  },

  /**
   * Get one segment
   */
  async segmentDetail(_root, { _id }: { _id: string }) {
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
        field: contentType === 'company' ? 'companyId' : 'customerId'
      }
    };

    const aggreEvents = await fetchElk({
      action: 'search',
      index: 'events',
      body: {
        aggs,
        query
      }
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
      subOf,
      boardId,
      pipelineId,
      conditionsConjunction
    }: {
      contentType: string;
      conditions;
      subOf?: string;
      boardId?: string;
      pipelineId?: string;
      conditionsConjunction?: 'and' | 'or';
    }
  ) {
    return fetchSegment(
      {
        name: 'preview',
        color: '#fff',
        subOf: subOf || '',
        boardId,
        pipelineId,
        contentType,
        conditions,
        conditionsConjunction
      },
      { returnCount: true }
    );
  }
};

requireLogin(segmentQueries, 'segmentsGetHeads');
requireLogin(segmentQueries, 'segmentDetail');
requireLogin(segmentQueries, 'segmentsPreviewCount');
requireLogin(segmentQueries, 'segmentsEvents');

checkPermission(segmentQueries, 'segments', 'showSegments', []);

export default segmentQueries;
