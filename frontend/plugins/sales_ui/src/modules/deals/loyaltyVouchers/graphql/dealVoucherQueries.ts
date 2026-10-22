import { gql } from '~/gql';

// Asked of loyalty, which owns vouchers and coupons.
export const DEAL_SALE_VOUCHERS = gql(`
  query DealLoyaltySaleVouchers(
    $ownerId: String!
    $totalAmount: Float
    $targetId: String
  ) {
    loyaltyOwnerSaleVouchers(
      ownerType: "customer"
      ownerId: $ownerId
      totalAmount: $totalAmount
      targetId: $targetId
    )
  }
`);

export const DEAL_COUPON_CHECK = gql(`
  query DealLoyaltyCouponCheck(
    $code: String!
    $ownerId: String
    $totalAmount: Float
    $targetId: String
  ) {
    loyaltyCouponCheck(
      code: $code
      ownerId: $ownerId
      totalAmount: $totalAmount
      targetId: $targetId
    )
  }
`);
