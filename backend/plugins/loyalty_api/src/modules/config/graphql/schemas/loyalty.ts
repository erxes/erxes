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
`;

export const mutations = `
  confirmLoyalties(checkInfo: JSON): JSON
  shareScore(ownerType: String, ownerId: String, score: Float, destinationOwnerId: String, destinationPhone: String, destinationEmail: String, destinationCode: String): String
`;
