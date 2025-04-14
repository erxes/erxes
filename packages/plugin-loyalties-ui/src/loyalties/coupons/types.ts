import { ICouponCampaign } from '../../configs/couponCampaign/types';
import { ICommonDoc } from '../common/types';

export interface ICouponDoc extends ICommonDoc {
  status: string;
}

export interface ICoupon extends ICouponDoc {
  _id: string;
  campaignId: string;
  code: string;
  usageLimit: number;
  usageCount: number;
  usageLogs: Array<{
    usedDate: Date;
    ownerId: string;
    value: number;
  }>;
  createdAt: Date;
  campaign: ICouponCampaign;
}
