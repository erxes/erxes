import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';

export const GET_CYCLES = gql`
query GetCyclesRecordTable($teamId: String, $orderBy: JSON, $sortMode: String, $aggregationPipeline: [JSON] ${GQL_CURSOR_PARAM_DEFS}) {
  getCycles(teamId: $teamId, orderBy: $orderBy, sortMode: $sortMode, aggregationPipeline: $aggregationPipeline ${GQL_CURSOR_PARAMS}) {
    list {
      _id
      name
      description
      startDate
      endDate
      teamId
      isCompleted
      isActive
      statistics
      donePercent
      unFinishedTasks
    }
    totalCount
    ${GQL_PAGE_INFO}
  }
}
`;
