import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Board,
  Pipeline,
  Stage,
  Deal,
  Task,
  Ticket,
  GrowthHack
} from './customResolvers';
import {
  Board as BoardMutations,
  Deal as DealMutations,
  Task as TaskMutations,
  Ticket as TicketMutations,
  GrowthHack as GrowthHackMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations
} from './mutations';
import {
  Board as BoardQueries,
  Deal as DealQueries,
  Task as TaskQueries,
  Ticket as TicketQueries,
  GrowthHack as GrowthHackQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries
} from './queries';

const resolvers: any = {
  ...customScalars,
  Board,
  Pipeline,
  Stage,
  Deal,
  Task,
  Ticket,
  GrowthHack,
  Mutation: {
    ...BoardMutations,
    ...DealMutations,
    ...TaskMutations,
    ...TicketMutations,
    ...GrowthHackMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations
  },
  Query: {
    ...BoardQueries,
    ...DealQueries,
    ...TaskQueries,
    ...TicketQueries,
    ...GrowthHackQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries
  }
};

export default resolvers;
