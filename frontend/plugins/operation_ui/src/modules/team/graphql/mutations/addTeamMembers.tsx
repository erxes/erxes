import { gql } from '~/gql';

export const ADD_TEAM_MEMBERS = gql(`
  mutation teamAddMembers($teamId: String!, $memberIds: [String]!) {
    teamAddMembers(_id: $teamId, memberIds: $memberIds) {
      _id
      memberId
      teamId
    }
  }
`);
