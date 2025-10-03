import { boardQueries } from '@/sales/graphql/resolvers/queries/boards';
import { checklistQueries } from '@/sales/graphql/resolvers/queries/checklists';
import { dealQueries } from '@/sales/graphql/resolvers/queries/deals';
import { pipelineLabelQueries } from '@/sales/graphql/resolvers/queries/labels';
import { pipelineQueries } from '@/sales/graphql/resolvers/queries/pipelines';
import { stageQueries } from '@/sales/graphql/resolvers/queries/stages';

import {
  Pos as QueriesPos,
  PosCovers as QueriesPosCovers,
  PosOrders as QueriesPosOrders,
} from '@/pos/graphql/resolvers/queries';

export const queries = {
  ...boardQueries,
  ...pipelineQueries,
  ...stageQueries,
  ...dealQueries,
  ...pipelineLabelQueries,
  ...checklistQueries,
  ...QueriesPos,
  ...QueriesPosOrders,
  ...QueriesPosCovers,
};
