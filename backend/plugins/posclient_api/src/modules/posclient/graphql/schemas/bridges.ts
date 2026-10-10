export const types = `
  type PosCustomer {
    _id: String!
    code: String
    primaryPhone: String
    primaryEmail: String
    firstName: String
    lastName: String
    primaryAddress: JSON
    addresses: [JSON]
  }

  type PosCustomerFormField {
    code: String!
    name: String!
    type: String!
    isSystem: Boolean
    options: JSON
  }

  type PosCustomerForm {
    canCreate: Boolean!
    rows: [[PosCustomerFormField]]
  }

  type PosLoyaltyTier {
    key: String
    name: String
  }

  type PosLoyaltyWallet {
    accountTypeId: String
    name: String
    balance: Float
    pending: Float
    tier: PosLoyaltyTier
    expiringSoon: JSON
  }

  type PosLoyaltyVoucher {
    _id: String!
    campaignId: String
    title: String
    voucherType: String
    kind: String
    value: Float
    expiresAt: Date
    autoApplied: Boolean
    applicable: Boolean
    reason: String
  }

  type PosCustomerLoyalty {
    accountNumber: String
    status: String
    wallets: [PosLoyaltyWallet]
    vouchers: [PosLoyaltyVoucher]
  }

  type PosLoyaltyEarn {
    walletName: String
    points: Float
    reasons: [String]
    error: String
  }

  type PosLoyaltyEarnPreview {
    hasRules: Boolean
    earns: [PosLoyaltyEarn]
  }

  input PosLoyaltyEarnItem {
    productId: String!
    amount: Float!
  }

  type PosLoyaltyPreviewLine {
    key: String!
    productId: String!
    percent: Float
    unitPrice: Float
    title: String
  }

  type PosLoyaltyPreviewBonus {
    productId: String!
    name: String!
    count: Float!
  }

  type PosLoyaltyPreview {
    lines: [PosLoyaltyPreviewLine!]!
    bonuses: [PosLoyaltyPreviewBonus!]!
  }

  input PosLoyaltyPreviewItem {
    key: String!
    productId: String!
    count: Float!
    unitPrice: Float!
    conditionCode: String
  }

  type PosProductCondition {
    _id: String!
    code: String!
    name: String!
  }

  type PosCustomerAddResult {
    customer: PosCustomer
    duplicate: PosCustomer
  }
`;

export const queries = `
  poscCustomers(searchValue: String!, type: String, perPage: Int, page: Int): [PosCustomer]
  poscCustomerDetail(_id: String!, type: String): PosCustomer
  poscCustomerForm: PosCustomerForm
  poscCustomerLoyalty(customerId: String!, totalAmount: Float): PosCustomerLoyalty
  poscProductConditions(productId: String!): [PosProductCondition]
  poscCouponCheck(code: String!, customerId: String, totalAmount: Float): String
  poscLoyaltyPreview(items: [PosLoyaltyPreviewItem!]!, customerId: String, couponCode: String, voucherId: String): PosLoyaltyPreview
  poscLoyaltyEarnPreview(items: [PosLoyaltyEarnItem!]!, totalAmount: Float!, customerId: String, orderType: String): PosLoyaltyEarnPreview
`;

export const mutations = `
  poscCustomersAdd(doc: JSON!): PosCustomerAddResult
`;
