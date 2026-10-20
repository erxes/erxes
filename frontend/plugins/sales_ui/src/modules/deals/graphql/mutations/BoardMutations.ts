import { gql } from '~/gql';

export const ADD_BOARD = gql(`
  mutation salesBoardsAdd($name: String!) {
    salesBoardsAdd(name: $name) {
      _id
    }
  }
`);

export const EDIT_BOARD = gql(`
  mutation salesBoardsEdit($_id: String!, $name: String!) {
    salesBoardsEdit(_id: $_id, name: $name) {
      _id
    }
  }
`);

export const REMOVE_BOARD = gql(`
  mutation salesBoardsRemove($_id: String!) {
    salesBoardsRemove(_id: $_id)
  }
`);
