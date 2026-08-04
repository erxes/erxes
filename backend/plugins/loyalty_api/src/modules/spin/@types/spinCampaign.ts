import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils/common';

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

export interface ISpinCampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
}
