import { gql } from '@apollo/client';

export const TASK_LIST_CHANGED = gql`
  subscription operationTaskListChanged($filter: ITaskFilter) {
    operationTaskListChanged(filter: $filter) {
      type
      task {
        _id
        name
        description
        status
        priority
        teamId
        number
        assigneeId
        startDate
        targetDate
        createdAt
        updatedAt
        createdBy
        cycleId
        projectId
        estimatePoint
      }
    }
  }
`;
