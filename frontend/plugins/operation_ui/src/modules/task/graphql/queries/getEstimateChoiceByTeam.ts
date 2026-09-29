import { gql } from '~/gql';

export const GET_ESTIMATE_CHOICE_BY_TEAM = gql(`
  query EstimateChoises($teamId: String!) {
    getTeamEstimateChoises(teamId: $teamId)
  }
`);
