import customScalars from '@erxes/api-utils/src/customScalars';
import {
  Board,
  Pipeline,
  Stage,
  DealListItem,
  Purchase,
  PurchaseListItem,
  Checklist,
} from './customResolvers';
import {
  Board as BoardMutations,
  Purchase as PurchaseMutations,
  PipelineLabel as PipelineLabelMutations,
  Checklists as ChecklistMutations,
} from './mutations';

import {
  Board as BoardQueries,
  Purchase as PurchaseQueries,
  PipelineLabel as PipelineLabelQueries,
  CheckLists as ChecklistQueries,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Board,
  Pipeline,
  Stage,
  DealListItem,
  Purchase,
  PurchaseListItem,
  Checklist,
  Mutation: {
    ...BoardMutations,
    ...PurchaseMutations,
    ...PipelineLabelMutations,
    ...ChecklistMutations,
  },
  Query: {
    ...BoardQueries,
    ...PurchaseQueries,
    ...PipelineLabelQueries,
    ...ChecklistQueries,
  },
};

export default resolvers;
