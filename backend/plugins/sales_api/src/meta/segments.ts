import {
  createSegmentEvaluateFieldsHandler,
  segmentModuleForContentType,
  SegmentConfigs,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { posSegments } from '~/modules/pos/meta/segments';
import { salesSegments } from '~/modules/sales/meta/segments/segments';

const segmentModules = { sales: salesSegments, pos: posSegments };

const moduleContext = async (subdomain: string) => ({
  models: await generateModels(subdomain),
  subdomain,
});

export default {
  dependentModules: [...(salesSegments.dependentModules || [])],
  contentTypes: [...salesSegments.contentTypes, ...posSegments.contentTypes],
  segmentFields: {
    ...salesSegments.segmentFields,
    ...posSegments.segmentFields,
  },
  segmentRelations: [
    ...(salesSegments.segmentRelations || []),
    ...(posSegments.segmentRelations || []),
  ],
  evaluateFields: createSegmentEvaluateFieldsHandler({
    modules: segmentModules,
    generateModels,
  }),
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
} as SegmentConfigs;
