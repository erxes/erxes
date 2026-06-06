import { gql } from '@apollo/client';

export const REMOVE_WEB = gql`
  mutation RemoveWeb($id: String!) {
    removeWeb(_id: $id) {
      _id
      name
      clientPortalId
    }
  }
`;
