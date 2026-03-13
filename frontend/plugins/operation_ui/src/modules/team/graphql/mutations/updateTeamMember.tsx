import gql from 'graphql-tag';

export const UPDATE_TEAM_MEMBER = gql`
  mutation teamUpdateMember($_id: String!) {
    teamUpdateMember(_id: $_id) {
      _id
    }
  }
`;
