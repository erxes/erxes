import { ICommonFields, ICommonDocument } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';
import { SPIN_STATUS } from './constants';

export interface ISpin extends ICommonFields {
  status?: string;
  voucherCampaignId?: string;
}

export interface ISpinDocument extends ISpin, ICommonDocument, Document {
  _id: string;
  status: string;

  // won
  awardId: string;
  voucherId: string;
}
