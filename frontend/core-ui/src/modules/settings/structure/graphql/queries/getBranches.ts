import { gql } from '@apollo/client';

const GET_BRANCH_DETAILS_BY_ID = gql`
  query BranchDetail($id: String!) {
    branchDetail(_id: $id) {
      _id
      address
      code
      parentId
      userCount
      title
      supervisorId
      userIds
      email
      phoneNumber
      radius
      status
      links
      image {
        name
        type
        url
      }
      coordinate {
        latitude
        longitude
      }
    }
  }
`;

export { GET_BRANCH_DETAILS_BY_ID };
