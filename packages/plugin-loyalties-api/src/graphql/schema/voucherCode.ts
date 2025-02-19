export const mutations = `
  checkVoucherCode(code: String, ownerId: String): String
  redeemVoucherCode(
    code: String,
    ownerId: String,
    ownerType: String
  ): JSON
  generateVoucherCodes(
    campaignId: String,
    prefix: String,
    suffix: String,
    codeLength: Int,
    usageLimit: Int,
    quantity: Int,
    staticCode: String,
    allowRepeatRedemption: Boolean,
  ): JSON
`;
