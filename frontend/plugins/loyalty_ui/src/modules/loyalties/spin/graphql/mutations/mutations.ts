import { gql } from '@apollo/client';

export const SPINS_ADD_MUTATION = gql`
  mutation SpinsAdd(
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
    $voucherCampaignId: String
  ) {
    spinsAdd(
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

export const SPINS_ADD_MANY_MUTATION = gql`
  mutation SpinsAddMany(
    $campaignId: String
    $ownerType: String
    $ownerIds: [String]
    $tagIds: [String]
    $status: String
  ) {
    spinsAddMany(
      campaignId: $campaignId
      ownerType: $ownerType
      ownerIds: $ownerIds
      tagIds: $tagIds
      status: $status
    )
  }
`;

export const SPINS_EDIT_MUTATION = gql`
  mutation SpinsEdit(
    $_id: String!
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
    $voucherCampaignId: String
  ) {
    spinsEdit(
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

export const DELETE_SPIN_MUTATION = gql`
  mutation SpinsRemove($_ids: [String]!) {
    spinsRemove(_ids: $_ids)
  }
`;
