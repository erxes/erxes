import { gql } from '~/gql';

export const DONATES_QUERY = gql(`
  query DonatesMain(
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
    donatesMain(
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
        donateScore
      }
      totalCount
    }
  }
`);

export const QUERY_DONATE_CAMPAIGNS = gql(`
  query DonateCampaigns($status: String, $searchValue: String, $perPage: Int) {
    donateCampaigns(
      status: $status
      searchValue: $searchValue
      limit: $perPage
    ) {
      list {
        _id
        title
        status
      }
    }
  }
`);
