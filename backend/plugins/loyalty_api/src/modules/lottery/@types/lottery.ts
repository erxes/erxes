import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument, ICommonFields } from '~/utils';

export interface ILottery extends ICommonFields {
  status?: string;
  voucherCampaignId?: string;
}

export interface ILotteryDocument extends ILottery, ICommonDocument, Document {
  _id: string;
  number: string;

  // won
  awardId: string;
  voucherId: string;
}

export interface ILotteryParams extends ICursorPaginateParams {
  campaignId?: string;
  status?: string;
  ownerType?: string;
  ownerId?: string;
  voucherCampaignId?: string;
}
