import { gql } from '@apollo/client';

const returnFields = `
  _id
  code
  title
  supervisorId
  userCount
`;

const commonDefs = `
  $title: String
  $description: String
  $supervisorId: String
  $code: String
  $parentId: String
  $userIds: [String]
`;

const commonVars = `
  title: $title
  description: $description
  supervisorId: $supervisorId
  code: $code
  parentId: $parentId
  userIds: $userIds
`;

const ADD_DEPARTMENT = gql`
  mutation DepartmentsAdd(${commonDefs}){
    departmentsAdd(${commonVars}){
      ${returnFields}
    }
  }
`;

const EDIT_DEPARTMENT = gql`
  mutation DepartmentsEdit($id: String! $workhours: JSON ${commonDefs}) {
    departmentsEdit(_id: $id, workhours: $workhours, ${commonVars}) {
      ${returnFields}
    }
  }
`;

const REMOVE_DEPARTMENTS = gql`
  mutation DepartmentsRemove($ids: [String!]) {
    departmentsRemove(ids: $ids)
  }
`;

export { ADD_DEPARTMENT, EDIT_DEPARTMENT, REMOVE_DEPARTMENTS };
