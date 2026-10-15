import { gql } from '~/gql';

export const LOTTERIES_ADD_MUTATION = gql(`
  mutation LotteriesAdd(
    $campaignId: String!
    $ownerId: String!
    $ownerType: String!
    $status: String
    $voucherCampaignId: String
  ) {
    lotteriesAdd(
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
      voucherCampaignId: $voucherCampaignId
    ) {
      _id
      campaignId
      ownerType
      status
      voucherCampaignId
    }
  }
`);

export const LOTTERIES_EDIT_MUTATION = gql(`
  mutation LotteriesEdit(
    $_id: String!
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
    $voucherCampaignId: String
  ) {
    lotteriesEdit(
      _id: $_id
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
      voucherCampaignId: $voucherCampaignId
    ) {
      _id
      campaignId
      ownerType
      status
      voucherCampaignId
    }
  }
`);

export const DELETE_LOTTERY_MUTATION = gql(`
  mutation LotteriesRemove($_ids: [String!]!) {
    lotteriesRemove(_ids: $_ids)
  }
`);
