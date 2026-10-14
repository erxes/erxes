import { gql } from '@apollo/client';

export const DONATES_ADD_MUTATION = gql`
  mutation DonatesAdd(
    $campaignId: String!
    $ownerId: String!
    $ownerType: String!
    $status: String
    $voucherCampaignId: String
    $donateScore: Float
  ) {
    donatesAdd(
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
      voucherCampaignId: $voucherCampaignId
      donateScore: $donateScore
    ) {
      _id
      campaignId
      ownerType
      status
      voucherCampaignId
    }
  }
`;

export const DONATES_EDIT_MUTATION = gql`
  mutation DonatesEdit(
    $_id: String!
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
    $voucherCampaignId: String
    $donateScore: Float
  ) {
    donatesEdit(
      _id: $_id
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
      voucherCampaignId: $voucherCampaignId
      donateScore: $donateScore
    ) {
      _id
      campaignId
      ownerType
      status
      voucherCampaignId
    }
  }
`;

export const DELETE_DONATE_MUTATION = gql`
  mutation DonatesRemove($_ids: [String!]!) {
    donatesRemove(_ids: $_ids)
  }
`;
