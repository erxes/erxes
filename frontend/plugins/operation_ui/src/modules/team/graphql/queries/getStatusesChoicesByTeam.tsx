import gql from 'graphql-tag';

export const GET_STATUSES_CHOICES_BY_TEAM = gql`
  query getStatusesChoicesByTeam($teamId: String!) {
    getStatusesChoicesByTeam(teamId: $teamId)
  }
`;

