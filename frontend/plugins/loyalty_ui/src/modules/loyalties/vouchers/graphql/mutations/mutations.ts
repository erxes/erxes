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

export const VOUCHERS_EDIT_MUTATION = gql`
  mutation VouchersEdit(
    $_id: String!
    $campaignId: String
    $ownerId: String
    $ownerType: String
    $status: String
  ) {
    vouchersEdit(
      _id: $_id
      campaignId: $campaignId
      ownerId: $ownerId
      ownerType: $ownerType
      status: $status
    ) {
      _id
      campaignId
      ownerType
      ownerId
      status
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
