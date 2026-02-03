import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils';

export interface IDonateAward extends Document {
  _id: string;
  minScore: number;
  voucherCampaignId: string;
}

export interface IDonateCampaign extends ICommonCampaignFields {
  awards?: IDonateAward[];
  maxScore?: number;
}

export interface IDonateCampaignDocument
  extends IDonateCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export interface IDonateCampaignParams extends ICursorPaginateParams {
  status?: string;
  searchValue?: string;
}
