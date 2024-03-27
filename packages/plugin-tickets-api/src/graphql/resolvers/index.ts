import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Board,
  Pipeline,
  Stage,
  Ticket,
  TicketListItem,
  Checklist,
} from './customResolvers';
import {
  Board as BoardMutations,
  Ticket as TicketMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations,
} from './mutations';

import {
  Board as BoardQueries,
  Ticket as TicketQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Board,
  Pipeline,
  Stage,
  Ticket,
  TicketListItem,
  Checklist,
  Mutation: {
    ...BoardMutations,
    ...TicketMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations,
  },
  Query: {
    ...BoardQueries,
    ...TicketQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries,
  },
};

export default resolvers;
