import { gql } from '@apollo/client';

const commonDefs = `
  $title: String
  $code: String
  $parentId: String
  $userIds: [String]
  $status: String
`;

const commonVals = `
  title: $title
  code: $code
  parentId: $parentId
  userIds: $userIds
  status: $status
`;

const returnValues = `
  _id
  code
  title
  parentId
  userCount
  userIds
  order
  status
`;

const ADD_POSITION = gql`
  mutation PositionsAdd(${commonDefs}) {
    positionsAdd(${commonVals}) {
      ${returnValues}
    }
}
`;
const EDIT_POSITION = gql`
  mutation PositionsEdit($id: String! ${commonDefs}) {
    positionsEdit(_id: $id, ${commonVals}) {
      ${returnValues}
    }
  }
`;
const REMOVE_POSITIONS = gql`
  mutation PositionsRemove($ids: [String!]) {
    positionsRemove(ids: $ids)
  }
`;

export { ADD_POSITION, EDIT_POSITION, REMOVE_POSITIONS };
