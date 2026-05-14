import gql from 'graphql-tag';

export const GET_TASK = gql`
  query getTask($_id: String!) {
    getTask(_id: $_id) {
      _id
      name
      description
      status
      priority
      teamId
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
  }
`;
