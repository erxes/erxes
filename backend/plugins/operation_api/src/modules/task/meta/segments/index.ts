import {
  TCoreModuleProducerContext,
  TSegmentProducers,
  TSegmentProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { evaluateTaskFields } from './evaluate';
import { TASK_SEGMENT_FIELD_MAP, TASK_TYPE } from './fields';
import { countTaskSegmentMembers, listTaskSegmentMembers } from './members';
import { applyTaskSegmentMembership } from './membership';
import { TASK_SEGMENT_RELATIONS } from './relations';

export const tasksSegments = {
  dependentModules: [
    {
      name: 'core',
      types: ['companies', 'customers', 'leads'],
      twoWay: true,
      associated: true,
    },
  ],

  contentTypes: [
    {
      contentType: TASK_TYPE,
      moduleName: 'task',
      type: 'tasks',
      description: 'Task',
    },
  ],

  segmentFields: TASK_SEGMENT_FIELD_MAP,

  segmentRelations: TASK_SEGMENT_RELATIONS,

  evaluateFields: async (
    data: TSegmentProducersInput[TSegmentProducers.EVALUATE_FIELDS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => evaluateTaskFields(models, data),

  listSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.LIST_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => listTaskSegmentMembers(models, data),

  countSegmentMembers: async (
    data: TSegmentProducersInput[TSegmentProducers.COUNT_MEMBERS],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => countTaskSegmentMembers(models, data),

  applyMembership: async (
    data: TSegmentProducersInput[TSegmentProducers.APPLY_MEMBERSHIP],
    { models }: TCoreModuleProducerContext<IModels>,
  ) => applyTaskSegmentMembership(models, data),
};
