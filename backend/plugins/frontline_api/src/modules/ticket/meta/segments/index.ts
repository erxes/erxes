import {
  TCoreModuleProducerContext,
  TSegmentProducers,
  TSegmentProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { ticketsSegmentConfigs } from './configs';
import { evaluateTicketFields } from './evaluate';
import { FRONTLINE_SEGMENT_FIELDS } from './fields';
import { countTicketSegmentMembers, listTicketSegmentMembers } from './members';
import { applyTicketSegmentMembership } from './membership';
import { TICKET_SEGMENT_RELATIONS } from './relations';

export const ticketsSegments = {
  dependentModules: ticketsSegmentConfigs.dependentModules,

  contentTypes: ticketsSegmentConfigs.contentTypes,

  segmentFields: FRONTLINE_SEGMENT_FIELDS,

  segmentRelations: TICKET_SEGMENT_RELATIONS,

  evaluateFields: async (
    data: TSegmentProducersInput[TSegmentProducers.EVALUATE_FIELDS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => evaluateTicketFields(models, data),

  listSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.LIST_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => listTicketSegmentMembers(models, data),

  countSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.COUNT_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => countTicketSegmentMembers(models, data),

  applyMembership: async (
    data: TSegmentProducersInput[TSegmentProducers.APPLY_MEMBERSHIP],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => applyTicketSegmentMembership(models, data),
};
