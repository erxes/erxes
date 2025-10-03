import gql from 'graphql-tag';

export const REMOVE_TEAM_MEMBER = gql`
  mutation teamRemoveMember($teamId: String!, $memberId: String!) {
    teamRemoveMember(teamId: $teamId, memberId: $memberId) {
      _id
    }
  }
`;
