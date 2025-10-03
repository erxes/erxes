import { gql } from '@apollo/client';

export const TASK_CHANGED = gql`
  subscription operationTaskChanged($_id: String!) {
    operationTaskChanged(_id: $_id) {
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
