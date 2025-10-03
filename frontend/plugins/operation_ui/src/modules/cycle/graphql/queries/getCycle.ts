import { gql } from '@apollo/client';

export const GET_CYCLE_DETAIL = gql`
  query GetCycleDetail($_id: String) {
    getCycle(_id: $_id) {
      _id
      description
      donePercent
      endDate
      isActive
      isCompleted
      name
      startDate
      statistics
      teamId
      unFinishedTasks
    }
  }
`;
