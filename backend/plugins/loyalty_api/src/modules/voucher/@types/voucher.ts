import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument, ICommonFields } from '~/utils';

export interface IVoucher extends ICommonFields {
  status?: string;
  bonusInfo?: any;

  config?: any;
}

export interface IVoucherDocument extends IVoucher, ICommonDocument, Document {
  _id: string;
}

export interface IVoucherParams extends ICursorPaginateParams {
  campaignId?: string;
  ownerId?: string;
  ownerType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface IVoucherInput extends IVoucher {
  ownerIds?: string[];
  tagIds?: string[];
}
