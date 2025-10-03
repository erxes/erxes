import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

const DEPARTMENTS_FIELDS = `
  _id
  title
  code
  parentId
  order
  userCount
`;

export const GET_DEPARTMENTS = gql`
  query departments(
    $ids: [String]
    $excludeIds: Boolean
    $searchValue: String
    $status: String
    $withoutUserFilter: Boolean
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    departmentsMain(
      ids: $ids
      excludeIds: $excludeIds
      ${GQL_CURSOR_PARAMS}
      searchValue: $searchValue
      status: $status
      withoutUserFilter: $withoutUserFilter

    ) {
      list{
        ${DEPARTMENTS_FIELDS}
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_DEPARTMENT_BY_ID = gql`
  query DepartmentDetail($id: String!) {
    departmentDetail(_id: $id) {
      _id
      code
      title
      parentId
      order
      workhours
    }
  }
`;
