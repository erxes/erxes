import { gql } from '@apollo/client';

export const UPDATE_CYCLE = gql`
  mutation UpdateCycle($input: CycleInput) {
    updateCycle(input: $input) {
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
  }
`;
