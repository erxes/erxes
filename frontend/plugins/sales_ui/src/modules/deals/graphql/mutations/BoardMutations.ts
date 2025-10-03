import gql from "graphql-tag";

const commonParamsDef = `
  $name: String!,
`;

const commonParams = `
  name: $name,
`;

export const ADD_BOARD = gql`
  mutation salesBoardsAdd(${commonParamsDef}) {
    salesBoardsAdd(${commonParams}) {
      _id
    }
  }
`;

export const EDIT_BOARD = gql`
  mutation salesBoardsEdit($_id: String!, ${commonParamsDef}) {
    salesBoardsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

export const REMOVE_BOARD = gql`
  mutation salesBoardsRemove($_id: String!) {
    salesBoardsRemove(_id: $_id)
  }
`;