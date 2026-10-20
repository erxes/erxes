import { gql } from '@apollo/client';

export const VOUCHERS_ADD_MUTATION = gql`
  mutation VouchersAdd(
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
  ) {
    vouchersAdd(
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
    ) {
      _id
      campaignId
      ownerType
      status
    }
  }
`;

export const VOUCHERS_ADD_MANY_MUTATION = gql`
  mutation VouchersAddMany(
    $campaignId: String
    $ownerType: String
    $ownerIds: [String]
    $tagIds: [String]
    $status: String
  ) {
    vouchersAddMany(
      campaignId: $campaignId
      ownerType: $ownerType
      ownerIds: $ownerIds
      tagIds: $tagIds
      status: $status
    )
  }
`;

// An issued voucher is only ever cancelled, marked used or extended.
export const VOUCHER_CANCEL_MUTATION = gql`
  mutation LoyaltyVoucherCancel($_id: String!, $reason: String!) {
    voucherCancel(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;

export const VOUCHER_MARK_USED_MUTATION = gql`
  mutation LoyaltyVoucherMarkUsed($_id: String!, $note: String!) {
    voucherMarkUsed(_id: $_id, note: $note) {
      _id
      status
    }
  }
`;

export const VOUCHER_EXTEND_MUTATION = gql`
  mutation LoyaltyVoucherExtend($_id: String!, $endDate: Date!) {
    voucherExtend(_id: $_id, endDate: $endDate) {
      _id
      expiresAt
    }
  }
`;

export const DELETE_VOUCHER_MUTATION = gql`
  mutation VouchersRemove($_ids: [String]!) {
    vouchersRemove(_ids: $_ids)
  }
`;

export const DELETE_VOUCHERS_BY_FILTER_MUTATION = gql`
  mutation VouchersRemoveByFilter(
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
    $fromDate: String
    $toDate: String
    $searchValue: String
  ) {
    vouchersRemoveByFilter(
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
      fromDate: $fromDate
      toDate: $toDate
      searchValue: $searchValue
    )
  }
`;

export const VOUCHER_RETURN_BILL_MUTATION = gql`
  mutation VoucherReturnBill($_id: String!) {
    voucherReturnBill(_id: $_id) {
      _id
      status
    }
  }
`;
