import {
  GET_BOARDS,
  GET_BOARD_COUNTS,
  GET_BOARD_DETAIL,
  GET_BOARD_GET_LAST,
} from '@/deals/graphql/queries/BoardsQueries';
import {
  GET_PIPELINES,
  GET_PIPELINE_DETAIL,
} from '@/deals/graphql/queries/PipelinesQueries';
import {
  GET_DEALS,
  GET_DEAL_DETAIL,
} from '@/deals/graphql/queries/DealsQueries';
import { GET_STAGES } from '@/deals/graphql/queries/StagesQueries';

export const BOARD_ARCHIVE_REFETCH_QUERIES = [
  GET_BOARDS,
  GET_BOARD_COUNTS,
  GET_BOARD_DETAIL,
  GET_BOARD_GET_LAST,
  GET_PIPELINES,
  GET_PIPELINE_DETAIL,
  GET_DEALS,
  GET_DEAL_DETAIL,
  GET_STAGES,
];
