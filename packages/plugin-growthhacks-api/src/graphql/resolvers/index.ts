import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Board,
  Pipeline,
  Stage,
  GrowthHack,
  Checklist,
} from './customResolvers';
import {
  Board as BoardMutations,
  GrowthHack as GrowthHackMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations,
} from './mutations';

import {
  Board as BoardQueries,
  GrowthHack as GrowthHackQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Board,
  Pipeline,
  Stage,
  GrowthHack,
  Checklist,
  Mutation: {
    ...BoardMutations,
    ...GrowthHackMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations,
  },
  Query: {
    ...BoardQueries,
    ...GrowthHackQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries,
  },
};

export default resolvers;
