export interface ICommonDoc {
  campaignId: string;
  createdAt: Date;
  usedAt: Date;

  ownerType: string;
  ownerId: string;
  voucherCampaignId?: string;
}
