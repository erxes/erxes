import { gql } from '@apollo/client';

export const GET_CONVERT_TASK_TEAMS = gql`
  query FrontlineConvertTaskTeams($userId: String) {
    getTeams(userId: $userId) {
      _id
      name
      icon
    }
  }
`;

export const GET_CONVERT_TASK_STATUSES = gql`
  query FrontlineConvertTaskStatuses($teamId: String!) {
    getStatusesChoicesByTeam(teamId: $teamId)
  }
`;
