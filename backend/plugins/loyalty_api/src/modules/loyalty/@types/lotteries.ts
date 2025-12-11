import { ICommonDocument, ICommonFields } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { LOTTERY_STATUS } from './constants';

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
