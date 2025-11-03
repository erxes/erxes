import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface ISpin {
  ownerId: string;
  ownerType: string;
  campaignId: string;
  status?: string;

  // won
  awardId?: string;
  voucherId?: string;

  voucherCampaignId?: string;

  createdBy?: string;
  updatedBy?: string;
}

export interface ISpinDocument extends ISpin, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpinParams extends ICursorPaginateParams {
  campaignId?: string;
  status?: string;
  ownerType?: string;
  ownerId?: string;
  voucherCampaignId?: string;
}
