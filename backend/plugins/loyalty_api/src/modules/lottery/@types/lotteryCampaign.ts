import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils';

export interface ILotteryAward extends Document {
  _id: string;
  name: string;
  voucherCampaignId: string;
  count: number;
  wonLotteryIds: string[];
}

export interface ILotteryCampaign extends ICommonCampaignFields {
  numberFormat: string;
  buyScore: number;

  awards: ILotteryAward[];
}

export interface ILotteryCampaignDocument
  extends ILotteryCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export interface ILotteryCampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
  awardId?: string;
  campaignId?: string;
}
