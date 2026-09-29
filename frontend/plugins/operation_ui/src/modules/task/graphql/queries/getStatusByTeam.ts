import { graphql } from '~/gql';

export const GET_STATUS_BY_TEAM = graphql(`
  query GetStatusByTeam($teamId: String!) {
    getStatusesChoicesByTeam(teamId: $teamId)
  }
`);
