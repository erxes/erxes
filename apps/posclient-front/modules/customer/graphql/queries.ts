import { gql } from "@apollo/client"

const poscCustomerDetail = gql`
  query poscCustomerDetail($_id: String!, $type: String) {
    poscCustomerDetail(_id: $_id, type: $type) {
      _id
      code
      primaryPhone
      firstName
      primaryEmail
      lastName
      __typename
    }
  }
`
// poscCustomers(searchValue: String!, type: String, perPage: Int, page: Int): [PosCustomer]
const poscCustomers = gql`
  query poscCustomers($searchValue: String!, $type: String) {
    poscCustomers(searchValue: $searchValue, type: $type) {
      _id
      code
      primaryPhone
      firstName
      primaryEmail
      lastName
    }
  }
`

const poscCustomerForm = gql`
  query poscCustomerForm {
    poscCustomerForm {
      canCreate
      rows {
        code
        name
        type
        isSystem
        options
      }
    }
  }
`

const poscCustomerLoyalty = gql`
  query poscCustomerLoyalty($customerId: String!, $totalAmount: Float) {
    poscCustomerLoyalty(customerId: $customerId, totalAmount: $totalAmount) {
      accountNumber
      status
      wallets {
        accountTypeId
        name
        balance
        pending
        tier {
          key
          name
        }
        expiringSoon
      }
      vouchers {
        _id
        title
        voucherType
        kind
        value
        expiresAt
        autoApplied
        applicable
        reason
      }
    }
  }
`

const poscCouponCheck = gql`
  query poscCouponCheck(
    $code: String!
    $customerId: String
    $totalAmount: Float
  ) {
    poscCouponCheck(
      code: $code
      customerId: $customerId
      totalAmount: $totalAmount
    )
  }
`

const poscLoyaltyPreview = gql`
  query poscLoyaltyPreview(
    $items: [PosLoyaltyPreviewItem!]!
    $customerId: String
    $couponCode: String
    $voucherId: String
  ) {
    poscLoyaltyPreview(
      items: $items
      customerId: $customerId
      couponCode: $couponCode
      voucherId: $voucherId
    ) {
      productId
      percent
      title
    }
  }
`

const queries = {
  poscCouponCheck,
  poscLoyaltyPreview,
  poscCustomerDetail,
  poscCustomers,
  poscCustomerForm,
  poscCustomerLoyalty,
}
export default queries
