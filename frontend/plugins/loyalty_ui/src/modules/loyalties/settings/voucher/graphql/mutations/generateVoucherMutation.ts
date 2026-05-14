import { gql } from '@apollo/client';

export const GENERATE_VOUCHER = gql`
  mutation VouchersAdd(
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
    $conditions: JSON
  ) {
    vouchersAdd(
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
      conditions: $conditions
    ) {
      _id
      campaignId
      voucherCampaignId
      ownerId
      ownerType
      status
      createdAt
    }
  }
`;
