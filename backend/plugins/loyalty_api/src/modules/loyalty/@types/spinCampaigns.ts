import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { ICommonCampaignFields, ICommonCampaignDocument } from './common';

export interface ISpinAward extends Document {
  _id: string;
  name: string;
  voucherCampaignId: string;
  probability: number;
}

export interface ISpinCampaign extends ICommonCampaignFields {
  buyScore?: number;
  awards?: ISpinAward[];
}

export interface ISpinCampaignDocument
  extends ISpinCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}
