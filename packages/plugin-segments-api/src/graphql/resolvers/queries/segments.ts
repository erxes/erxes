import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { es, serviceDiscovery } from '../../../configs';
import { IContext } from '../../../connectionResolver';
import { sendMessage } from '../../../messageBroker';
import { fetchSegment } from './queryBuilder';

const segmentQueries = {
  async segmentsGetTypes() {
    const serviceNames = await serviceDiscovery.getServices();

    let types: Array<{ name: string; description: string }> = [];

    for (const serviceName of serviceNames) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config.meta || {};

      if (meta.segments) {
        const descriptionMap = meta.segments.descriptionMap;

        const serviceTypes = meta.segments.contentTypes.map(contentType => ({
          contentType: `${serviceName}:${contentType}`,
          description: descriptionMap[contentType]
        }));

        types = [...types, ...serviceTypes];
      }
    }

    return types;
  },

  async segmentsGetAssociationTypes(
    _root,
    { contentType },
    { subdomain }: IContext
  ) {
    const [serviceName, type] = contentType.split(':');
    const service = await serviceDiscovery.getService(serviceName, true);
    const meta = service.config.meta || {};

    if (!meta.segments) {
      return [];
    }

    const descriptionMap = meta.segments.descriptionMap;

    const types = await sendMessage({
      subdomain,
      serviceName,
      action: `segments.associationTypes`,
      isRPC: true,
      data: { mainType: type }
    });

    return types.map(atype => ({
      value: atype,
      description: descriptionMap[atype.split(':')[1]]
    }));
  },

  /**
   * Segments list
   */
  segments(
    _root,
    { contentTypes, config }: { contentTypes: string[]; config?: any },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = {
      ...commonQuerySelector,
      contentType: { $in: contentTypes },
      name: { $exists: true }
    };

    if (config) {
      for (const key of Object.keys(config)) {
        selector[`config.${key}`] = config[key];
      }
    }

    return models.Segments.find(selector).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  async segmentsGetHeads(
    _root,
    _args,
    { models, commonQuerySelector }: IContext
  ) {
    return models.Segments.find({
      ...commonQuerySelector,
      name: { $exists: true },
      $or: [{ subOf: { $exists: false } }, { subOf: '' }]
    });
  },

  /**
   * Get one segment
   */
  async segmentDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Segments.findOne({ _id });
  },

  /**
   * Return event names with attribute names
   */
  async segmentsEvents(
    _root,
    { contentType }: { contentType: string },
    { subdomain }: IContext
  ) {
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

    const aggreEvents = await es.fetchElk({
      subdomain,
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
      config,
      conditionsConjunction
    }: {
      contentType: string;
      conditions;
      subOf?: string;
      config: any;
      conditionsConjunction?: 'and' | 'or';
    },
    { models, subdomain }: IContext
  ) {
    return fetchSegment(
      models,
      subdomain,
      {
        name: 'preview',
        color: '#fff',
        subOf: subOf || '',
        config,
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
