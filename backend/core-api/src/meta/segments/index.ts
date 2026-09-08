import { initSegmentProducers } from 'erxes-api-shared/core-modules';
import { Express } from 'express';
import { generateModels } from '~/connectionResolvers';
import { CORE_SEGMENT_CONTENT_TYPES } from './contentTypes';
import { evaluateCoreFields } from './evaluateFields';
import { CORE_SEGMENT_FIELDS } from './fields';
import { countCoreSegmentMembers, listCoreSegmentMembers } from './members';
import { applyCoreSegmentMembership } from './membership';
import { CORE_SEGMENT_FIELD_NAMESPACES } from './namespaces';
import { CORE_SEGMENT_RELATIONS } from './relations';

export const initSegmentCoreProducers = (app: Express) =>
  initSegmentProducers(app, 'core', {
    contentTypes: CORE_SEGMENT_CONTENT_TYPES,

    segmentFields: CORE_SEGMENT_FIELDS,
    segmentFieldNamespaces: CORE_SEGMENT_FIELD_NAMESPACES,
    segmentRelations: CORE_SEGMENT_RELATIONS,

    evaluateFields: async ({ subdomain, data }) =>
      evaluateCoreFields(await generateModels(subdomain), data),

    listSegmentMembers: async ({ subdomain, data }) =>
      listCoreSegmentMembers(await generateModels(subdomain), data),

    countSegmentMembers: async ({ subdomain, data }) =>
      countCoreSegmentMembers(await generateModels(subdomain), data),

    applyMembership: async ({ subdomain, data }) =>
      applyCoreSegmentMembership(await generateModels(subdomain), data),
  });

export {
  CORE_SEGMENT_CONTENT_TYPES,
  CORE_SEGMENT_FIELDS,
  CORE_SEGMENT_RELATIONS,
};
