import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface ILottery {
  ownerId: string;
  ownerType: string;

  campaignId: string;

  status?: string;
  voucherCampaignId?: string;
}

export interface ILotteryDocument extends ILottery, Document {
  number: string;

  // won
  awardId: string;
  voucherId: string;

  createdAt: Date;
  updatedAt: Date;

  createdBy: string;
  updatedBy: string;
}

export interface ILotteryParams extends ICursorPaginateParams {
  campaignId?: string;
  status?: string;
  ownerType?: string;
  ownerId?: string;
  voucherCampaignId?: string;
}
