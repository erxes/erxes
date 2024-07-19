import customScalars from "@erxes/api-utils/src/customScalars";
import {
  SalesBoard,
  SalesPipeline,
  SalesStage,
  Deal,
  DealListItem,
  SalesChecklist
} from "./customResolvers";
import {
  Board as BoardMutations,
  Deal as DealMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations
} from "./mutations";

import {
  Board as BoardQueries,
  Deal as DealQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries
} from "./queries";

const resolvers: any = {
  ...customScalars,
  SalesBoard,
  SalesPipeline,
  SalesStage,
  Deal,
  DealListItem,
  SalesChecklist,
  Mutation: {
    ...BoardMutations,
    ...DealMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations
  },
  Query: {
    ...BoardQueries,
    ...DealQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries
  }
};

export default resolvers;
