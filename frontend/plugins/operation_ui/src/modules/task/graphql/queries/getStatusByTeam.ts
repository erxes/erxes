import { gql } from '@apollo/client';

export const GET_STATUS_BY_TEAM = gql`
  query GetStatusByTeam($teamId: String!) {
    getStatusesChoicesByTeam(teamId: $teamId)
  }
`;
