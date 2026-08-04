import { gql } from '@apollo/client';

export const SPINS_QUERY = gql`
  query SpinsMain(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $campaignId: String
    $status: String
    $ownerId: String
    $ownerType: String
    $voucherCampaignId: String
  ) {
    spinsMain(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      campaignId: $campaignId
      status: $status
      ownerId: $ownerId
      ownerType: $ownerType
      voucherCampaignId: $voucherCampaignId
    ) {
      list {
        _id
        campaignId
        createdAt
        usedAt
        ownerType
        ownerId
        voucherCampaignId
        owner
        status
        number
      }
      totalCount
    }
  }
`;

export const SPIN_COMPANIES_QUERY = gql`
  query SpinCompanies($limit: Int, $searchValue: String) {
    companies(limit: $limit, searchValue: $searchValue) {
      list {
        _id
        primaryName
        names
      }
    }
  }
`;

export const SPIN_CUSTOMERS_QUERY = gql`
  query SpinCustomers($limit: Int, $searchValue: String) {
    customers(limit: $limit, searchValue: $searchValue) {
      list {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
      }
    }
  }
`;
