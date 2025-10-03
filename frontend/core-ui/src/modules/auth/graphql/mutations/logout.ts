import { gql } from '@apollo/client';

export const Logout = gql`
  mutation logout {
    logout
  }
`;
