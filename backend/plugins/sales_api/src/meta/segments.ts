import {
  createCoreModuleProducerHandler,
  createSegmentEvaluateFieldsHandler,
  segmentModuleForContentType,
  SegmentConfigs,
  splitType,
  TSegmentProducers,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { posSegments } from '~/modules/pos/meta/segments';
import { salesSegments } from '~/modules/sales/meta/segments/segments';

const modules = {
  sales: salesSegments,
  pos: posSegments,
};

/** Modules that answer for their own records; `pos` owns none of these yet. */
const segmentModules = { sales: salesSegments };

const moduleContext = async (subdomain: string) => ({
  models: await generateModels(subdomain),
  subdomain,
});

export default {
  dependentModules: [...(salesSegments.dependentModules || [])],
  contentTypes: [...salesSegments.contentTypes, ...posSegments.contentTypes],
  segmentFields: { ...salesSegments.segmentFields },
  segmentRelations: [...(salesSegments.segmentRelations || [])],
  // Routed by the requests, not the subject type: a relation into deals is
  // measured for a customer, so the batch arrives with a subject type this
  // plugin does not own.
  evaluateFields: createSegmentEvaluateFieldsHandler({
    modules: segmentModules,
    generateModels,
  }),
  // Routed by the module that declared the content type. Deriving it from the
  // string would look for a module named `deal`, which does not exist.
  listSegmentMembers: async ({ subdomain, data }) => {
    const module = segmentModuleForContentType(
      segmentModules,
      data.contentType,
    );

    return module
      ? module.listSegmentMembers(data, await moduleContext(subdomain))
      : { ids: [], unsupported: [data.contentType] };
  },
  countSegmentMembers: async ({ subdomain, data }) => {
    const module = segmentModuleForContentType(
      segmentModules,
      data.contentType,
    );

    return module
      ? module.countSegmentMembers(data, await moduleContext(subdomain))
      : { count: 0, unsupported: [data.contentType] };
  },
  applyMembership: async ({ subdomain, data }) => {
    const module = segmentModuleForContentType(
      segmentModules,
      data.contentType,
    );

    return module
      ? module.applyMembership(data, await moduleContext(subdomain))
      : { counts: {}, unsupported: [data.contentType] };
  },
  propertyConditionExtender: createCoreModuleProducerHandler({
    moduleName: 'segments',
    modules,
    methodName: TSegmentProducers.PROPERTY_CONDITION_EXTENDER,
    extractModuleName: (input) =>
      splitType(input.condition?.propertyType || '')[1],
    generateModels,
  }),
  associationFilter: createCoreModuleProducerHandler({
    moduleName: 'segments',
    modules,
    methodName: TSegmentProducers.ASSOCIATION_FILTER,
    extractModuleName: (input) => splitType(input.mainType || '')[1],
    generateModels,
  }),
  esTypesMap: createCoreModuleProducerHandler({
    moduleName: 'segments',
    modules,
    methodName: TSegmentProducers.ES_TYPES_MAP,
    extractModuleName: (input) => input.collectionType,
    generateModels,
  }),
  initialSelector: createCoreModuleProducerHandler({
    moduleName: 'segments',
    modules,
    methodName: TSegmentProducers.INITIAL_SELECTOR,
    extractModuleName: (input) =>
      splitType(input.segment?.contentType || '')[1],
    generateModels,
  }),
} as SegmentConfigs;
