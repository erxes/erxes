import { gql } from '~/gql';

export const TASK_CHANGED = gql(`
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
        githubIssueNumber
        githubIssueUrl
        githubRepoName
        propertiesData
      }
    }
  }
`);
