import {
  ICursorPaginateParams,
  TCreatedVia,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument, ICommonFields } from '~/utils';

/** The order or deal a voucher is held for or was used on. */
export interface IVoucherTarget {
  targetType: string;
  targetId: string;
}

/** What one voucher gives, fixed when it is issued. */
export interface IVoucherTerms {
  title?: string;
  voucherType?: string;
  kind?: string;
  value?: number;
  restrictions?: Record<string, unknown>;
  bonusProductId?: string;
  bonusCount?: number;
}

export type TVoucherHistoryAction =
  | 'issued'
  | 'held'
  | 'released'
  | 'used'
  | 'returned'
  | 'cancelled'
  | 'markedUsed'
  | 'extended';

export interface IVoucherHistoryEntry {
  action: TVoucherHistoryAction;
  at: Date;
  by?: string;
  targetType?: string;
  targetId?: string;
  note?: string;
}

export interface IVoucherBonusUse {
  usedCount: number;
  targetId?: string;
}

export interface IVoucher extends ICommonFields {
  status?: string;
  bonusInfo?: IVoucherBonusUse[];

  config?: any;
  // Absent on vouchers issued before terms were kept; they read the campaign.
  terms?: IVoucherTerms;
  createdVia?: TCreatedVia;
  usedIn?: Partial<IVoucherTarget> & { note?: string };
  heldAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancelReason?: string;
  history?: IVoucherHistoryEntry[];
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
  // Open vouchers ending within this many days.
  expiresWithin?: number;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: 1 | -1;
  searchValue?: string;
}

export interface IVoucherInput extends IVoucher {
  ownerIds?: string[];
  tagIds?: string[];
}
