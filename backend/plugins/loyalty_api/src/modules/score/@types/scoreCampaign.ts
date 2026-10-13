import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument } from '~/utils';
import { IEarnTable, TScoreSkip } from '@/score/@types/earnTable';

// Limits on paying with points, checked by loyalty for every channel.
export interface ISpendRules {
  minBalance?: number;
  // Highest share of the order, in percent, that points may pay.
  maxShare?: number;
  // Points are spent only in multiples of this.
  step?: number;
}


export interface IScoreCampaign {
  title: string;
  description: string;
  order?: number;
  // Earning: a table of rows. Spending: rules on paying with points.
  add?: { table?: IEarnTable };
  subtract?: { rules?: ISpendRules };
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
