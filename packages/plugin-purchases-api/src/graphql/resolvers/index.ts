import customScalars from "@erxes/api-utils/src/customScalars";
import {
  PurchasesBoard,
  PurchasesPipeline,
  PurchasesStage,
  Purchase,
  PurchaseListItem,
  PurchasesChecklist
} from "./customResolvers";
import {
  Board as BoardMutations,
  Purchase as PurchaseMutations,
  PipelineTemplate as PipelineTemplateMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations
} from "./mutations";

import {
  Board as BoardQueries,
  Purchase as PurchaseQueries,
  PipelineTemplate as PipelineTemplateQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries
} from "./queries";

const resolvers: any = {
  ...customScalars,
  PurchasesBoard,
  PurchasesPipeline,
  PurchasesStage,
  Purchase,
  PurchaseListItem,
  PurchasesChecklist,
  Mutation: {
    ...BoardMutations,
    ...PurchaseMutations,
    ...PipelineTemplateMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations
  },
  Query: {
    ...BoardQueries,
    ...PurchaseQueries,
    ...PipelineTemplateQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries
  }
};

export default resolvers;
