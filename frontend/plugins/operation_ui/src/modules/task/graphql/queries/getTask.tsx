import { gql } from '~/gql';

export const GET_TASK = gql(`
  query getTask($_id: String!) {
    getTask(_id: $_id) {
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
`);
