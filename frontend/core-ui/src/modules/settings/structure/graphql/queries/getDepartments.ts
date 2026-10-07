import { gql } from '@apollo/client';

const GET_DEPARTMENT_DETAIL_BY_ID = gql`
  query DepartmentDetail($id: String!) {
    departmentDetail(_id: $id) {
      _id
      code
      description
      parentId
      supervisorId
      title
      userIds
      userCount
      status
    }
  }
`;

export { GET_DEPARTMENT_DETAIL_BY_ID };
