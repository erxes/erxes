import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils/common';

export type TVoucherOwnerLimitPeriod = 'campaign' | 'year' | 'month';

/** At most `count` from this campaign to one owner within each period. */
export interface IVoucherOwnerLimit {
  count: number;
  period: TVoucherOwnerLimitPeriod;
}

export const VOUCHER_AUTO_ISSUE_KINDS = ['birthday'] as const;
export type TVoucherAutoIssueKind = (typeof VOUCHER_AUTO_ISSUE_KINDS)[number];

export const VOUCHER_AUTO_ISSUE_ENGINES = ['broadcast', 'automation'] as const;
export type TVoucherAutoIssueEngine =
  (typeof VOUCHER_AUTO_ISSUE_ENGINES)[number];

export interface IVoucherAutoIssuePart {
  engine: TVoucherAutoIssueEngine;
  id: string;
}

/**
 * One way this campaign is handed out on its own: the core broadcast and
 * automation that do it, kept together so they are switched and removed as one.
 */
export interface IVoucherAutoIssue {
  kind: TVoucherAutoIssueKind;
  segmentId: string;
  parts: IVoucherAutoIssuePart[];
}

export interface IVoucherCampaign extends ICommonCampaignFields {
  buyScore: number;

  score: number;
  scoreAction: string;

  voucherType: string;

  productCategoryIds: string[];
  productIds: string[];
  discountPercent: number;

  bonusProductId: string;
  bonusCount: number;

  coupon: string;

  spinCampaignId: string;
  spinCount: number;

  lotteryCampaignId: string;
  lotteryCount: number;

  kind: 'amount' | 'percent';
  value: number;
  restrictions: any;
  perOwnerLimit?: IVoucherOwnerLimit | null;
  autoIssue?: IVoucherAutoIssue[];
}

export interface IVoucherCampaignDocument
  extends IVoucherCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export interface IVoucherCampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
  voucherType?: string;
  excludeVoucherTypes?: string[];
  equalTypeCampaignId?: string;
  _ids?: string[];
}
