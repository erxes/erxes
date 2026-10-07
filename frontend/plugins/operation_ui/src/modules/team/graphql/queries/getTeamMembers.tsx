import { gql } from '~/gql';

export const GET_TEAM_MEMBERS = gql(`
  query getTeamMembers($teamId: String, $teamIds: [String]) {
    getTeamMembers(teamId: $teamId, teamIds: $teamIds) {
      _id
      memberId
      teamId
    }
  }
`);
