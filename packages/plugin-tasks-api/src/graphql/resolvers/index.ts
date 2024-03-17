import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Board,
  Pipeline,
  Stage,
  Task,
  TaskListItem,
  Checklist,
} from './customResolvers';
import {
  Board as BoardMutations,
  Task as TaskMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations,
} from './mutations';

import {
  Board as BoardQueries,
  Task as TaskQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Board,
  Pipeline,
  Stage,
  Task,
  TaskListItem,
  Checklist,
  Mutation: {
    ...BoardMutations,
    ...TaskMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations,
  },
  Query: {
    ...BoardQueries,
    ...TaskQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries,
  },
};

export default resolvers;
