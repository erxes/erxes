export interface ILottery {
  _id: string;
  campaignId?: string;
  lotteryCampaignId?: string;
  ownerType?: string;
  ownerId?: string;
  owner?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    primaryPhone?: string;
    primaryName?: string;
  };
  status?: string;
  number?: string;
  voucherCampaignId?: string;
  createdAt?: string;
  usedAt?: string;
}
