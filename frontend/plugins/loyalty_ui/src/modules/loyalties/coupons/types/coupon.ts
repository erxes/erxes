export interface ICoupon {
  _id: string;
  code?: string;
  campaignId?: string;
  campaign?: { title?: string };
  ownerType?: string;
  ownerId?: string;
  status?: string;
  usageLimit?: number;
  usageCount?: number;
  redemptionLimitPerUser?: number;
  createdAt?: string;
  updatedAt?: string;
}
