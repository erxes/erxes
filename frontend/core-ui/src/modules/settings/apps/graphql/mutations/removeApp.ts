import { gql } from '@apollo/client';

const REMOVE_APP = gql`
  mutation AppsRemove($_id: String!) {
    appsRemove(_id: $_id)
  }
`;

export { REMOVE_APP };
