export interface IVoucher {
  _id: string;
  campaignId?: string;
  voucherCampaignId?: string;
  ownerType?: string;
  ownerId?: string;
  owner?: { _id: string; firstName?: string; lastName?: string; primaryEmail?: string; primaryPhone?: string; primaryName?: string };
  status?: string;
  createdAt?: string;
  usedAt?: string;
}
