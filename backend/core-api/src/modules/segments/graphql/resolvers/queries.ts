import {
  gatherDependentServicesType,
  ISegmentContentType,
} from 'erxes-api-shared/core-modules';
import {
  getPlugin,
  getPlugins,
  getTotalDocCount,
  isEnabled,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { fetchSegment } from '../../utils/fetchSegment';
import { IPreviewParams } from '../../types';

interface IAssociatedType {
  type: string;
  description: string;
}

export const segmentQueries = {
  async segmentsGetTypes() {
    const pluginNames = await getPlugins();
    let types: Array<{ name: string; description: string }> = [];
    for (const serviceName of pluginNames) {
      const plugin = await getPlugin(serviceName);
      const meta = plugin.config.meta || {};
      if (meta.segments) {
        const pluginTypes = (meta.segments.contentTypes || []).flatMap(
          (ct: ISegmentContentType) => {
            if (ct.hideInSidebar) {
              return [];
            }
            return {
              contentType: `${serviceName}:${ct.type}`,
              description: ct.description,
            };
          },
        );
        types = [...types, ...pluginTypes];
      }
    }
    return types;
  },

  async segmentsGetAssociationTypes(_root, { contentType }) {
    const [pluginName] = contentType.split(':');
    const plugin = await getPlugin(pluginName);
    const meta = plugin.config.meta || {};
    if (!meta.segments) {
      return [];
    }
    // get current services content types
    const serviceCts = meta.segments.contentTypes || [];
    const associatedTypes: IAssociatedType[] = serviceCts.map(
      (ct: ISegmentContentType) => ({
        type: `${pluginName}:${ct.type}`,
        description: ct.description,
      }),
    );
    // gather dependent services contentTypes
    const dependentModules = meta.segments.dependentModules || [];
    for (const dModule of dependentModules) {
      if (!(await isEnabled(dModule.name))) {
        continue;
      }
      const depModule = await getPlugin(dModule.name);
      const depServiceMeta = depModule.config.meta || {};
      if (depServiceMeta.segments) {
        let contentTypes = depServiceMeta.segments.contentTypes || [];
        if (!!dModule?.types?.length) {
          contentTypes = contentTypes.filter(({ type }) =>
            (dModule?.types || []).includes(type),
          );
        }
        contentTypes.forEach((ct: ISegmentContentType) => {
          associatedTypes.push({
            type: `${dModule.name}:${ct.type}`,
            description: ct.description,
          });
        });
      }
    }
    // gather contentTypes of services that are dependent on current service
    await gatherDependentServicesType(
      pluginName,
      (ct: ISegmentContentType, sName: string) => {
        associatedTypes.push({
          type: `${sName}:${ct.type}`,
          description: ct.description,
        });
      },
    );
    return associatedTypes.map((atype) => ({
      value: atype.type,
      description: atype.description,
    }));
  },

  /**
   * Segments list
   */
  async segments(
    _root,
    {
      contentTypes,
      config,
      ids,
      searchValue,
      excludeIds,
    }: {
      contentTypes: string[];
      config?: any;
      ids: string[];
      searchValue: string;
      excludeIds: string[];
    },
    { models, commonQuerySelector }: IContext,
  ) {
    let selector: any = {
      ...commonQuerySelector,
      contentType: { $in: contentTypes },
      name: { $exists: true, $nin: [null, '', undefined] },
    };

    if (config) {
      for (const key of Object.keys(config)) {
        selector[`config.${key}`] = config[key];
      }
    }

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }
    if (excludeIds?.length) {
      selector._id = { $nin: excludeIds };
    }

    if (ids) {
      selector = { $or: [{ _id: { $in: ids } }, { ...selector }] };
    }

    return models.Segments.find(selector).sort({ name: 1 });
  },

  /**
   * Only segment that has no sub segments
   */
  async segmentsGetHeads(
    _root,
    { contentType },
    { models, commonQuerySelector }: IContext,
  ) {
    let selector: any = {};

    if (contentType) {
      selector.contentType = contentType;
    }
    return models.Segments.find({
      ...commonQuerySelector,
      ...selector,
      name: { $exists: true },
      $or: [{ subOf: { $exists: false } }, { subOf: '' }],
    });
  },

  /**
   * Get one segment
   */
  async segmentDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Segments.findOne({ _id });
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
      conditionsConjunction,
    }: IPreviewParams,
    { models, subdomain }: IContext,
  ) {
    const total = await getTotalDocCount();
    const count = await fetchSegment(
      models,
      subdomain,
      {
        name: 'preview',
        color: '#fff',
        subOf: subOf || '',
        config,
        contentType,
        conditions,
        conditionsConjunction,
      },
      { returnCount: true },
    );
    return { count, total };
  },
};

// requireLogin(segmentQueries, "segmentsGetHeads");
// requireLogin(segmentQueries, "segmentDetail");
// requireLogin(segmentQueries, "segmentsPreviewCount");
// requireLogin(segmentQueries, "segmentsEvents");

// checkPermission(segmentQueries, "segments", "showSegments", []);
