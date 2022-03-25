export interface ICommonDoc {
  campaignId: string,
  createdAt: Date,
  usedAt: Date,

  ownerType: String,
  ownerId: string,
  voucherCampaignId?: string,
}