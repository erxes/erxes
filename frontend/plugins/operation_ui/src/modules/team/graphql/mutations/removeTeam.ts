import { gql } from '@apollo/client';

export const REMOVE_TEAM = gql`
  mutation RemoveTeam($id: String!) {
    teamRemove(_id: $id) {
      _id
    }
  }
`;
