import { gql } from '~/gql';

export const GET_PROJECT_PROGRESS_BY_TEAM = gql(`
  query getProjectProgressByTeam($_id: String!) {
    getProjectProgressByTeam(_id: $_id) {
      teamId
      totalScope
      totalStartedScope
      totalCompletedScope
    }
  }
`);
