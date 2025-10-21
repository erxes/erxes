import { SegmentConfigs, splitType } from 'erxes-api-shared/core-modules';
import { salesSegments } from '~/modules/sales/segments';

const modules = {
  sales: salesSegments,
};

type ModuleKeys = keyof typeof modules;

export default {
  dependentServices: [...salesSegments.dependentServices],
  contentTypes: [...salesSegments.contentTypes],
  propertyConditionExtender: (context, data) => {
    const [_, moduleName] = splitType(data?.condition?.propertyType || '');
    return modules[moduleName as ModuleKeys].propertyConditionExtender(
      context,
      data,
    );
  },
  associationFilter: (context, data) => {
    const [_, moduleName] = splitType(data?.propertyType || '');
    return modules[moduleName as ModuleKeys].associationFilter(context, data);
  },
  esTypesMap: (_, { collectionType }) => {
    return modules[collectionType as ModuleKeys].esTypesMap();
  },
  initialSelector: (context, data) => {
    const [_, moduleName] = splitType(data?.segment?.contentType || '');
    return modules[moduleName as ModuleKeys].initialSelector(context, data);
  },
} as SegmentConfigs;
