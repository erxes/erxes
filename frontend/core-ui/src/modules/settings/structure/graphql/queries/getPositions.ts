import { gql } from '@apollo/client';

const GET_POSITION_DETAILS_BY_ID = gql`
  query PositionDetail($id: String) {
    positionDetail(_id: $id) {
      _id
      code
      order
      parentId
      status
      title
      userIds
    }
  }
`;

export { GET_POSITION_DETAILS_BY_ID };
