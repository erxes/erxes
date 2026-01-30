import { Document } from 'mongoose';

/**
 * Embedded lottery award (not a mongoose document)
 */
export interface ILotteryAward {
  _id: string; 
  name: string;
  voucherCampaignId: string;
  count: number;
  wonLotteryIds: string[];
}

/**
 * Lottery campaign base fields
 */
export interface ILotteryCampaign {
  name: string;
  description?: string;

  numberFormat: string;
  buyScore: number;

  awards: ILotteryAward[];

  // common campaign-like fields (inlined)
  startDate?: Date;
  endDate?: Date;
  status?: string;

  createdAt?: Date;
  updatedAt?: Date;

  createdBy?: string;
  updatedBy?: string;
}

/**
 * Lottery campaign mongoose document
 */
export interface ILotteryCampaignDocument
  extends ILotteryCampaign,
    Document {
  _id: string;
}
