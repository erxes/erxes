import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument, ICommonFields } from '~/utils';

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

export interface ISpinParams extends ICursorPaginateParams {
  campaignId?: string;
  status?: string;
  ownerType?: string;
  ownerId?: string;
  voucherCampaignId?: string;
}
