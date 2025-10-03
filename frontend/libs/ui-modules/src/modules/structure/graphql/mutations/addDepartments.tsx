import { gql } from '@apollo/client';

export const DEPARTMENTS_ADD = gql`
  mutation DepartmentsAdd($title: String, $code: String, $parentId: String) {
    departmentsAdd(title: $title, code: $code, parentId: $parentId) {
      _id
    }
  }
`;
