import { gql } from '@apollo/client';

export const VOUCHERS_QUERY = gql`
  query VouchersMain(
    $page: Int
    $perPage: Int
    $campaignId: String
    $status: String
    $ownerId: String
    $ownerType: String
    $searchValue: String
    $fromDate: String
    $toDate: String
    $sortField: String
    $sortDirection: Int
  ) {
    vouchersMain(
      page: $page
      perPage: $perPage
      campaignId: $campaignId
      status: $status
      ownerId: $ownerId
      ownerType: $ownerType
      searchValue: $searchValue
      fromDate: $fromDate
      toDate: $toDate
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      list {
        _id
        campaignId
        createdAt
        usedAt
        ownerType
        ownerId
        status
      }
      totalCount
    }
  }
`;

export const VOUCHER_COMPANIES_QUERY = gql`
  query VoucherCompanies($limit: Int, $searchValue: String) {
    companies(limit: $limit, searchValue: $searchValue) {
      list {
        _id
        primaryName
        names
        avatar
        size
        website
        industry
        businessType
        status
        code
        location
        getTags {
          _id
          name
          colorCode
        }
      }
    }
  }
`;

export const VOUCHER_CUSTOMERS_QUERY = gql`
  query VoucherCustomers($searchValue: String, $perPage: Int, $page: Int) {
    voucherCustomers(
      searchValue: $searchValue
      perPage: $perPage
      page: $page
    ) {
      _id
      code
      primaryPhone
      primaryEmail
      firstName
      lastName
      primaryAddress
      addresses
    }
  }
`;
