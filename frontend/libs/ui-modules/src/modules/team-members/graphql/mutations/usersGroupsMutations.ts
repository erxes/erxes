import { gql } from '@apollo/client';

export const ADD_USERS_GROUPS = gql`
  mutation UsersGroupsAdd(
    $name: String!
    $description: String
    $memberIds: [String]
  ) {
    usersGroupsAdd(
      name: $name
      description: $description
      memberIds: $memberIds
    ) {
      _id
      description
      memberIds
      name
    }
  }
`;

export const REMOVE_USERS_GROUPS = gql`
  mutation UsersGroupsRemove($id: String!) {
    usersGroupsRemove(_id: $id)
  }
`;

export const COPY_USERS_GROUP = gql`
  mutation UsersGroupsCopy($id: String!, $memberIds: [String]) {
    usersGroupsCopy(_id: $id, memberIds: $memberIds) {
      _id
      name
      description
      memberIds
    }
  }
`;

export const EDIT_USERS_GROUP = gql`
  mutation UsersGroupsEdit(
    $id: String!
    $name: String!
    $description: String
    $memberIds: [String]
  ) {
    usersGroupsEdit(
      _id: $id
      name: $name
      description: $description
      memberIds: $memberIds
    ) {
      _id
      name
      description
      memberIds
    }
  }
`;
