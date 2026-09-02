import { salesSegmentConfigs } from '@/sales/meta/segments/segmentConfigs';
import {
  TCoreModuleProducerContext,
  TSegmentProducers,
  TSegmentProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { evaluateSalesFields } from './evaluate';
import { SALES_SEGMENT_FIELDS } from './fields';
import { SALES_SEGMENT_RELATIONS } from './relations';
import { countDealSegmentMembers, listDealSegmentMembers } from './members';
import { applyDealSegmentMembership } from './membership';

export const salesSegments = {
  dependentModules: salesSegmentConfigs.dependentModules,

  contentTypes: salesSegmentConfigs.contentTypes,

  segmentFields: SALES_SEGMENT_FIELDS,

  segmentRelations: SALES_SEGMENT_RELATIONS,

  evaluateFields: async (
    data: TSegmentProducersInput[TSegmentProducers.EVALUATE_FIELDS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => evaluateSalesFields(models, data),

  listSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.LIST_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => listDealSegmentMembers(models, data),

  countSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.COUNT_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => countDealSegmentMembers(models, data),

  applyMembership: async (
    data: TSegmentProducersInput[TSegmentProducers.APPLY_MEMBERSHIP],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => applyDealSegmentMembership(models, data),
};
