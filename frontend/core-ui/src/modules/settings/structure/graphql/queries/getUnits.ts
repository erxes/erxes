import { gql } from '@apollo/client';

const GET_UNIT_DETAILS_BY_ID = gql`
  query UnitDetail($id: String!) {
    unitDetail(_id: $id) {
      _id
      code
      departmentId
      description
      supervisorId
      title
      userCount
      userIds
    }
  }
`;

export { GET_UNIT_DETAILS_BY_ID };
