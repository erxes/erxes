import { TVoucherOwnerLimit } from '../utils/voucherOwnerLimit';
import { TVoucherValidity } from '../utils/voucherTerm';
export interface IVoucher {
  _id: string;
  title: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
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
  perOwnerLimit?: TVoucherOwnerLimit | null;
  validity?: TVoucherValidity | null;
  conditions: any;
}
