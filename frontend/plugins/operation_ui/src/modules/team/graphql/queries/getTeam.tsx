import { gql } from '~/gql';

export const GET_TEAM = gql(`
  query getTeam($_id: String!) {
    getTeam(_id: $_id) {
      _id
      name
      icon
      description
      estimateType
      cycleEnabled
      triageEnabled
      taskCount
      memberCount
      createdAt
      updatedAt
    }
  }
`);
