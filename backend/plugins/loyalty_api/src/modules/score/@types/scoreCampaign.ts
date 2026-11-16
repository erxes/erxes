import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument } from '~/utils';
import { IEarnTable, TScoreSkip } from '@/score/@types/earnTable';

export interface IScoreCampaign {
  title: string;
  description: string;
  order?: number;
  // Earning only; spending is the wallet's (`spendRules` on the account type).
  add?: { table?: IEarnTable };
  createdUserId: string;
  // Derived from the account type; never accepted from clients.
  ownerType?: string;
  accountTypeId?: string;
  // Balance field of the account type; set from the account type, never by clients.
  fieldId?: string;
  status: string;

  restrictions?: any;
  additionalConfig?: any;
}

export interface IScoreCampaignDocument
  extends Document,
    ICommonCampaignDocument,
    IScoreCampaign {
  _id: string;
}

export interface DoCampaignTypes {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  target: any;
  oldTarget?: any;
  targetId?: string;
  actionMethod: 'add' | 'subtract';
  serviceName?: string;
  // Earning rows the caller turns on; all rows when absent.
  earnRowKeys?: string[];
  // Told why nothing was written when the campaign moves no points.
  onSkip?: (skips: TScoreSkip[]) => void;
}

export interface IScoreCampaignParams extends ICursorPaginateParams {
  status?: string;
  searchValue?: string;
  serviceName?: string;
}
