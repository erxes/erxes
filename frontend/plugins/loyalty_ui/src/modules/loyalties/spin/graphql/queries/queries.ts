import { gql } from '~/gql';

export const SPINS_QUERY = gql(`
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
`);
