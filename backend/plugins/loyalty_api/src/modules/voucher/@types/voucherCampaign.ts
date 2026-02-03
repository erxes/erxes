import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils/common';

export interface IVoucherCampaign extends ICommonCampaignFields {
  buyScore: number;

  score: number;
  scoreAction: string;

  voucherType: string;

  productCategoryIds: string[];
  productIds: string[];
  discountPercent: number;

  bonusProductId: string;
  bonusCount: number;

  coupon: string;

  spinCampaignId: string;
  spinCount: number;

  lotteryCampaignId: string;
  lotteryCount: number;

  kind: 'amount' | 'percent';
  value: number;
  restrictions: any;
}

export interface IVoucherCampaignDocument
  extends IVoucherCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export interface IVoucherCampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
  voucherType?: string;
  equalTypeCampaignId?: string;
  _ids?: string[];
}
