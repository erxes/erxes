import { gql } from '~/gql';

export const VOUCHERS_QUERY = gql(`
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
    $expiresWithin: Int
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
      expiresWithin: $expiresWithin
    ) {
      list {
        _id
        campaignId
        createdAt
        usedAt
        ownerType
        ownerId
        status
        terms
        expiresAt
        usedIn
        heldAt
        cancelledAt
        cancelReason
        createdVia
        history
      }
      totalCount
    }
  }
`);

export const VOUCHER_CP_USER_QUERY = gql(`
  query VoucherOwnerCpUser($_id: String!) {
    getClientPortalUser(_id: $_id) {
      _id
      firstName
      lastName
      email
      phone
      erxesCustomerId
    }
  }
`);
