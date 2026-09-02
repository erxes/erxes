import {
  TCoreModuleProducerContext,
  TSegmentProducers,
  TSegmentProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { inboxSegmentConfigs } from './configs';
import { evaluateInboxFields } from './evaluate';
import { INBOX_SEGMENT_FIELDS } from './fields';
import {
  countInboxSegmentMembers,
  listInboxSegmentMembers,
} from './members';
import { applyInboxSegmentMembership } from './membership';
import { INBOX_SEGMENT_RELATIONS } from './relations';

export const inboxSegments = {
  contentTypes: inboxSegmentConfigs.contentTypes,

  segmentFields: INBOX_SEGMENT_FIELDS,

  segmentRelations: INBOX_SEGMENT_RELATIONS,

  evaluateFields: async (
    data: TSegmentProducersInput[TSegmentProducers.EVALUATE_FIELDS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => evaluateInboxFields(models, data),

  listSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.LIST_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => listInboxSegmentMembers(models, data),

  countSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.COUNT_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => countInboxSegmentMembers(models, data),

  applyMembership: async (
    data: TSegmentProducersInput[TSegmentProducers.APPLY_MEMBERSHIP],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => applyInboxSegmentMembership(models, data),
};

export { conversationsChanged } from './events';
export { CONVERSATION_TYPE, MESSAGE_TYPE } from './fields';
