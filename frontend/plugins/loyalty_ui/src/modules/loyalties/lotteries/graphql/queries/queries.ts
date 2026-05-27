import { gql } from '@apollo/client';

export const LOTTERIES_QUERY = gql`
  query LotteriesMain(
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
    lotteriesMain(
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

export const LOTTERY_COMPANIES_QUERY = gql`
  query LotteryCompanies($limit: Int, $searchValue: String) {
    companies(limit: $limit, searchValue: $searchValue) {
      list {
        _id
        primaryName
        names
      }
    }
  }
`;

export const LOTTERY_CUSTOMERS_QUERY = gql`
  query LotteryCustomers($limit: Int, $searchValue: String) {
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
