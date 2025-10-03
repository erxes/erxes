import { gql } from '@apollo/client';

const commonDefs = `
  $title: String
  $description: String
  $supervisorId: String
  $code: String
  $departmentId: String
  $userIds: [String]
`;

const commonVars = `
  title: $title
  description: $description
  supervisorId: $supervisorId
  code: $code
  departmentId: $departmentId
  userIds: $userIds
`;

const returnFields = `
  _id
  code
  departmentId
  description
  supervisorId
  title
  userCount
`;

const ADD_UNIT = gql`
  mutation UnitsAdd(
    ${commonDefs}
  ) {
    unitsAdd(
      ${commonVars}
    ) {
      ${returnFields}
    }
  }
`;

const EDIT_UNIT = gql`
  mutation UnitsEdit(
    $id: String!
    ${commonDefs}
    ) {
    unitsEdit(
      _id: $id,
      ${commonVars}
      ) {
      ${returnFields}
    }
  }
`;

const REMOVE_UNITS = gql`
  mutation UnitsRemove($ids: [String!]) {
    unitsRemove(ids: $ids)
  }
`;

export { ADD_UNIT, EDIT_UNIT, REMOVE_UNITS };
