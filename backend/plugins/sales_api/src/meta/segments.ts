import {
  createCoreModuleProducerHandler,
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

export default {
  dependentModules: [...(salesSegments.dependentModules || [])],
  contentTypes: [...salesSegments.contentTypes, ...posSegments.contentTypes],
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
