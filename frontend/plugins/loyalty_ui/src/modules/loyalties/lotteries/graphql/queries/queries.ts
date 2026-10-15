import { gql } from '~/gql';

export const LOTTERIES_QUERY = gql(`
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
`);
