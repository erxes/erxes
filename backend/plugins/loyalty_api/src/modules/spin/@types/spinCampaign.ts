import { Document } from 'mongoose';
import {
  ICommonCampaignFields,
  ICommonCampaignDocument,
} from '~/utils/common';


export interface ISpinAward {
  _id: string;
  name: string;
  voucherCampaignId: string;
  probability: number;
}


export interface ISpinCampaign extends ICommonCampaignFields {
  buyScore?: number;
  awards?: ISpinAward[];
}

/* -------------------- document -------------------- */

export interface ISpinCampaignDocument
  extends ISpinCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}
