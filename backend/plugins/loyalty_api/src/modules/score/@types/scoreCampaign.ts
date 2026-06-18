import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument } from '~/utils';

export interface IScoreCampaignValue {
  placeholder: string;
  currencyRatio: string;
}

export interface IScoreCampaign {
  title: string;
  description: string;
  order?: number;
  add?: IScoreCampaignValue;
  subtract?: IScoreCampaignValue;
  set?: IScoreCampaignValue;
  createdUserId: string;
  ownerType: string;
  fieldGroupId: string;
  fieldName: string;
  fieldId: string;
  status: string;

  onlyClientPortal?: boolean;
  restrictions?: any;
  additionalConfig?: any;
}

export interface IScoreCampaignDocument
  extends Document,
    ICommonCampaignDocument,
    Omit<IScoreCampaign, 'set'> {
  _id: string;
}

export interface DoCampaignTypes {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  target: any;
  oldTarget?: any;
  targetId?: string;
  actionMethod: 'add' | 'subtract' | 'set';
  serviceName?: string;
}

export interface IScoreCampaignParams extends ICursorPaginateParams {
  status?: string;
  searchValue?: string;
  serviceName?: string;
}
