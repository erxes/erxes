import gql from 'graphql-tag';

export const UPDATE_TEAM_MEMBER = gql`
  mutation teamUpdateMember($_id: String!, $role: String) {
    teamUpdateMember(_id: $_id, role: $role) {
      _id
    }
  }
`;
