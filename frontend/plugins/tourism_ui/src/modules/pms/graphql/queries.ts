import { gql } from '@apollo/client';

const PmsBranchList = gql`
  query PmsBranchList(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    pmsBranchList(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      name
      description
      createdAt
      userId
    }
  }
`;

const PmsBranchDetail = gql`
  query PmsBranchDetail($id: String!) {
    pmsBranchDetail(_id: $id) {
      _id
      createdAt
      userId
      name
      description
      user1Ids
      user2Ids
      user3Ids
      user4Ids
      user5Ids
      paymentIds
      paymentTypes
      departmentId
      token
      erxesAppToken
      permissionConfig
      uiOptions
      pipelineConfig
      extraProductCategories
      roomCategories
      time
      discount
      checkintime
      checkouttime
      checkinamount
      checkoutamount
    }
  }
`;

const Payments = gql`
  query Payments($status: String, $kind: String) {
    payments(status: $status, kind: $kind) {
      _id
      name
      kind
      status
      config
      createdAt
    }
  }
`;

export const pmsQueries = { PmsBranchList, PmsBranchDetail, Payments };
