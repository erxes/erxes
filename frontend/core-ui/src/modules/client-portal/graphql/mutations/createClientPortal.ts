import { gql } from '@apollo/client';

export const CREATE_CLIENT_PORTAL = gql`
  mutation clientPortalAdd($name: String!) {
    clientPortalAdd(name: $name) {
      _id
      name
    }
  }
`;
