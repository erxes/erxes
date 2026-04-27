export interface IVoucher {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  voucherType: string;
  kind: string;
  value?: number;
  buyScore?: number;
  bonusProductId?: string;
  bonusCount?: number;
  spinCampaignId?: string;
  spinCount?: number;
  lotteryCount?: number;
  restrictions?: {
    minimumSpend?: number;
    maximumSpend?: number;
    categoryIds?: string[];
    excludeCategoryIds?: string[];
    productIds?: string[];
    excludeProductIds?: string[];
    tag?: string;
    orExcludeTag?: string;
  };
  conditions: any;
}
