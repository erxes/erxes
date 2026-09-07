import {
  TCoreModuleProducerContext,
  TSegmentProducers,
  TSegmentProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { posSegmentConfigs } from './posSegmentConfigs';
import { evaluatePosFields } from './segments/evaluate';
import { POS_SEGMENT_FIELDS } from './segments/fields';
import {
  countPosSegmentMembers,
  listPosSegmentMembers,
} from './segments/members';
import { applyPosSegmentMembership } from './segments/membership';
import { POS_SEGMENT_RELATIONS } from './segments/relations';

export const posSegments = {
  contentTypes: posSegmentConfigs.contentTypes,

  segmentFields: POS_SEGMENT_FIELDS,

  segmentRelations: POS_SEGMENT_RELATIONS,

  evaluateFields: async (
    data: TSegmentProducersInput[TSegmentProducers.EVALUATE_FIELDS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => evaluatePosFields(models, data),

  listSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.LIST_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => listPosSegmentMembers(models, data),

  countSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.COUNT_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => countPosSegmentMembers(models, data),

  applyMembership: async (
    data: TSegmentProducersInput[TSegmentProducers.APPLY_MEMBERSHIP],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => applyPosSegmentMembership(models, data),
};
