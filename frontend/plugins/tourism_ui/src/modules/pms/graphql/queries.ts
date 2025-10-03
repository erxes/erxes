import { gql } from '@apollo/client';

const PmsBranchList = gql`
  query pmsBranchList($sortField: String, $sortDirection: Int) {
    pmsBranchList(sortField: $sortField, sortDirection: $sortDirection) {
      _id
      name
      description
      createdAt
      token
      erxesAppToken
      user1Ids
      user2Ids
      user3Ids
      user4Ids
      user5Ids
      paymentIds
      paymentTypes
      user {
        _id
        details {
          avatar
          fullName
        }
      }
      uiOptions
      permissionConfig
      pipelineConfig
      extraProductCategories
      roomCategories
      discount
      time
      checkintime
      checkouttime
      checkinamount
      checkoutamount
    }
  }
`;

export const pmsQueries = { PmsBranchList };
