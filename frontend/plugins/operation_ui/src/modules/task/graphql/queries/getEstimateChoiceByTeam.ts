import { graphql } from '~/gql';

export const GET_ESTIMATE_CHOICE_BY_TEAM = graphql(`
  query EstimateChoises($teamId: String) {
    getTeamEstimateChoises(teamId: $teamId)
  }
`);
