import {
  createSegmentEvaluateFieldsHandler,
  SegmentConfigs,
  segmentModuleForContentType,
} from 'erxes-api-shared/core-modules';
import { generateModels } from '~/connectionResolvers';
import { inboxSegments } from '~/modules/inbox/meta/segments';
import { ticketsSegments } from '~/modules/ticket/meta/segments';

const segmentModules = { tickets: ticketsSegments, inbox: inboxSegments };

const moduleContext = async (subdomain: string) => ({
  models: await generateModels(subdomain),
  subdomain,
});

export default {
  dependentModules: [...(ticketsSegments.dependentModules || [])],
  contentTypes: [
    ...ticketsSegments.contentTypes,
    ...inboxSegments.contentTypes,
  ],

  segmentFields: {
    ...ticketsSegments.segmentFields,
    ...inboxSegments.segmentFields,
  },
  segmentRelations: [
    ...(ticketsSegments.segmentRelations || []),
    ...(inboxSegments.segmentRelations || []),
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
