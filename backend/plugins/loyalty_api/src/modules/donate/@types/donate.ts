import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument, ICommonFields } from '~/utils';

export interface IDonate extends ICommonFields {
  donateScore?: number;
  awardId?: string;
  voucherId?: string;
  status?: string;
  voucherCampaignId?: string;
  number?: string;
}

export interface IDonateDocument extends IDonate, ICommonDocument, Document {
  _id: string;
}

export interface IDonateListParams extends ICursorPaginateParams {
  searchValue?: string;
  campaignId?: string;
  ownerType?: string;
  ownerId?: string;
  status?: string;
  statuses?: string[];
  awardId?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: 1 | -1;
  voucherCampaignId?: string;
}
