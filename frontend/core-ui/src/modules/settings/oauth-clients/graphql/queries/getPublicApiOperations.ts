import { gql } from '@apollo/client';

export const GET_PUBLIC_API_OPERATIONS = gql`
  query SettingsPublicApiOperations {
    publicApiOperations {
      id
      name
      description
      operationName
      kind
    }
  }
`;
