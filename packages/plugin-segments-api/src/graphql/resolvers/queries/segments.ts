import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import {
  gatherDependentServicesType,
  ISegmentContentType
} from '@erxes/api-utils/src/segments';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { serviceDiscovery } from '../../../configs';
import { IContext } from '../../../connectionResolver';
import { fetchSegment } from './queryBuilder';

interface IPreviewParams {
  contentType: string;
  conditions;
  subOf?: string;
  config: any;
  conditionsConjunction?: 'and' | 'or';
}

interface IAssociatedType {
  type: string;
  description: string;
}

const segmentQueries = {
  async segmentsGetTypes() {
    const serviceNames = await serviceDiscovery.getServices();

    let types: Array<{ name: string; description: string }> = [];

    for (const serviceName of serviceNames) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config.meta || {};

      if (meta.segments) {
        const serviceTypes = (meta.segments.contentTypes || []).flatMap(
          (ct: ISegmentContentType) => {
            if (ct.hideInSidebar) {
              return [];
            }

            return {
              contentType: `${serviceName}:${ct.type}`,
              description: ct.description
            };
          }
        );

        types = [...types, ...serviceTypes];
      }
    }

    return types;
  },

  async segmentsGetAssociationTypes(_root, { contentType }) {
    const [serviceName] = contentType.split(':');

    const service = await serviceDiscovery.getService(serviceName, true);
    const meta = service.config.meta || {};

    if (!meta.segments) {
      return [];
    }

    // get current services content types
    const serviceCts = meta.segments.contentTypes || [];

    const associatedTypes: IAssociatedType[] = serviceCts.map(
      (ct: ISegmentContentType) => ({
        type: `${serviceName}:${ct.type}`,
        description: ct.description
      })
    );

    // gather dependent services contentTypes
    const dependentServices = meta.segments.dependentServices || [];

    for (const dService of dependentServices) {
      if (!(await serviceDiscovery.isEnabled(dService.name))) {
        continue;
      }

      const depService = await serviceDiscovery.getService(dService.name, true);
      const depServiceMeta = depService.config.meta || {};

      if (depServiceMeta.segments) {
        const contentTypes = depServiceMeta.segments.contentTypes || [];

        contentTypes.forEach((ct: ISegmentContentType) => {
          associatedTypes.push({
            type: `${dService.name}:${ct.type}`,
            description: ct.description
          });
        });
      }
    }

    // gather contentTypes of services that are dependent on current service
    await gatherDependentServicesType(
      serviceName,
      (ct: ISegmentContentType, sName: string) => {
        associatedTypes.push({
          type: `${sName}:${ct.type}`,
          description: ct.description
        });
      }
    );

    return associatedTypes.map(atype => ({
      value: atype.type,
      description: atype.description
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

    const aggreEvents = await fetchEs({
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
    }: IPreviewParams,
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
