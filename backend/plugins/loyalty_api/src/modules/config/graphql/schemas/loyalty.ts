export const types = `
  type Loyalty {
    ownerId: String
    ownerType: String
    score: Float

    vouchers: [Voucher]
    lotteries: [Lottery]
    spins: [Spin]
    donates: [Donate]
  }
`;

export const queries = `
  loyalties(ownerType: String ownerId: String, statuses: [String]): Loyalty
  checkLoyalties(ownerType: String, ownerId: String, products: JSON): JSON
  loyaltyOwnerSaleVouchers(ownerType: String!, ownerId: String!, totalAmount: Float, targetId: String): JSON
  loyaltyCouponCheck(code: String!, ownerId: String, totalAmount: Float, targetId: String): String
`;

export const mutations = `
  confirmLoyalties(checkInfo: JSON): JSON
  shareScore(ownerType: String, ownerId: String, score: Float, destinationOwnerId: String, destinationPhone: String, destinationEmail: String, destinationCode: String, campaignId: String): String
  cpShareScore(ownerType: String, ownerId: String, score: Float, destinationOwnerId: String, destinationPhone: String, destinationEmail: String, destinationCode: String, campaignId: String): String
`;
