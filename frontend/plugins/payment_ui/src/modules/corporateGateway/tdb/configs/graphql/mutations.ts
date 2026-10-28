import gql from 'graphql-tag';

export const addConfig = gql`
  mutation tdbConfigsAdd(
    $name: String!
    $description: String
    $apiUrl: String!
    $clientId: String!
    $clientSecret: String!
    $testMode: Boolean
  ) {
    tdbConfigsAdd(
      name: $name
      description: $description
      apiUrl: $apiUrl
      clientId: $clientId
      clientSecret: $clientSecret
      testMode: $testMode
    ) {
      _id
      name
      description
      apiUrl
      clientId
      testMode
    }
  }
`;

export const editConfig = gql`
  mutation tdbConfigsEdit(
    $_id: String!
    $name: String!
    $description: String
    $apiUrl: String!
    $clientId: String!
    $clientSecret: String!
    $testMode: Boolean
  ) {
    tdbConfigsEdit(
      _id: $_id
      name: $name
      description: $description
      apiUrl: $apiUrl
      clientId: $clientId
      clientSecret: $clientSecret
      testMode: $testMode
    ) {
      _id
      name
      description
      apiUrl
      clientId
      testMode
    }
  }
`;

export const removeConfig = gql`
  mutation tdbConfigsRemove($_id: String!) {
    tdbConfigsRemove(_id: $_id)
  }
`;