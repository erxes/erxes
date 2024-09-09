import customScalars from "@erxes/api-utils/src/customScalars";
import {
  TicketsBoard,
  TicketsPipeline,
  TicketsStage,
  Ticket,
  TicketListItem,
  TicketsChecklist
} from "./customResolvers";
import {
  Board as BoardMutations,
  Ticket as TicketMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations
} from "./mutations";

import {
  Board as BoardQueries,
  Ticket as TicketQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries
} from "./queries";

const resolvers: any = {
  ...customScalars,
  TicketsBoard,
  TicketsPipeline,
  TicketsStage,
  Ticket,
  TicketListItem,
  TicketsChecklist,
  Mutation: {
    ...BoardMutations,
    ...TicketMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations
  },
  Query: {
    ...BoardQueries,
    ...TicketQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries
  }
};

export default resolvers;
