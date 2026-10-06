import { gql } from '~/gql';

export const GET_TASKS = gql(`
  query GetTasks($filter: ITaskFilter) {
    getTasks(filter: $filter) {
      list {
        _id
        name
        description
        status
        priority
        teamId
        number
        tagIds
        assigneeId
        startDate
        targetDate
        createdAt
        updatedAt
        createdBy
        cycleId
        projectId
        estimatePoint
        milestoneId
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);
