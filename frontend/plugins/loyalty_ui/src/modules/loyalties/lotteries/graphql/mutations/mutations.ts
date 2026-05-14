import { gql } from '@apollo/client';

export const LOTTERIES_ADD_MUTATION = gql`
  mutation LotteriesAdd(
    $campaignId: String
    $ownerId: String
    $ownerType: String
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
`;

export const LOTTERIES_ADD_MANY_MUTATION = gql`
  mutation LotteriesAddMany(
    $campaignId: String
    $ownerType: String
    $ownerIds: [String]
    $tagIds: [String]
    $status: String
  ) {
    lotteriesAddMany(
      campaignId: $campaignId
      ownerType: $ownerType
      ownerIds: $ownerIds
      tagIds: $tagIds
      status: $status
    )
  }
`;

export const LOTTERIES_EDIT_MUTATION = gql`
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
`;

export const DELETE_LOTTERY_MUTATION = gql`
  mutation LotteriesRemove($_ids: [String]!) {
    lotteriesRemove(_ids: $_ids)
  }
`;
