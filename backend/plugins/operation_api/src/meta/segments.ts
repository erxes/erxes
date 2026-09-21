import {
  createSegmentEvaluateFieldsHandler,
  SegmentConfigs,
  segmentModuleForContentType,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { projectsSegments } from '~/modules/project/meta/segments';
import { tasksSegments } from '~/modules/task/meta/segments';

const segmentModules = { task: tasksSegments };

const moduleContext = async (subdomain: string) => ({
  models: await generateModels(subdomain),
  subdomain,
});

export default {
  dependentModules: [
    ...tasksSegments.dependentModules,
    ...projectsSegments.dependentModules,
  ],
  contentTypes: [
    ...tasksSegments.contentTypes,
    ...projectsSegments.contentTypes,
  ],

  segmentFields: { ...tasksSegments.segmentFields },
  segmentRelations: [...(tasksSegments.segmentRelations || [])],

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
