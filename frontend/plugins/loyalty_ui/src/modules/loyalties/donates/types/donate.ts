export interface IDonate {
  _id: string;
  campaignId?: string;
  donateCampaignId?: string;
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
  donateScore?: number;
  createdAt?: string;
  usedAt?: string;
}
