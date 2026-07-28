import gql from 'graphql-tag';
import { configFields } from './fragments';

export const addConfig = gql`
  mutation tdbConfigsAdd(
    $name: String!
    $description: String
    $apiUrl: String!
    $username: String!
    $password: String!
    $testMode: Boolean
  ) {
    tdbConfigsAdd(
      name: $name
      description: $description
      apiUrl: $apiUrl
      username: $username
      password: $password
      testMode: $testMode
    ) {
      ${configFields}
    }
  }
`;

export const editConfig = gql`
  mutation tdbConfigsEdit(
    $_id: String!
    $name: String!
    $description: String
    $apiUrl: String!
    $username: String!
    $password: String!
    $testMode: Boolean
  ) {
    tdbConfigsEdit(
      _id: $_id
      name: $name
      description: $description
      apiUrl: $apiUrl
      username: $username
      password: $password
      testMode: $testMode
    ) {
      ${configFields}
    }
  }
`;

export const removeConfig = gql`
  mutation tdbConfigsRemove($_id: String!) {
    tdbConfigsRemove(_id: $_id)
  }
`;
