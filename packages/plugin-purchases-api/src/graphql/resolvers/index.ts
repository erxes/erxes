import customScalars from "@erxes/api-utils/src/customScalars";
import {
  Board,
  Pipeline,
  Stage,
  Deal,
  DealListItem,
  Purchase,
  PurchaseListItem,
  Checklist
} from "./customResolvers";
import {
  Board as BoardMutations,
  Deal as DealMutations,
  Purchase as PurchaseMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations
} from "./mutations";

import {
  Board as BoardQueries,
  Deal as DealQueries,
  Purchase as PurchaseQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries
} from "./queries";

const resolvers: any = {
  ...customScalars,
  Board,
  Pipeline,
  Stage,
  Deal,
  DealListItem,
  Purchase,
  PurchaseListItem,
  Checklist,
  Mutation: {
    ...BoardMutations,
    ...DealMutations,
    ...PurchaseMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations
  },
  Query: {
    ...BoardQueries,
    ...DealQueries,
    ...PurchaseQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries
  }
};

export default resolvers;
