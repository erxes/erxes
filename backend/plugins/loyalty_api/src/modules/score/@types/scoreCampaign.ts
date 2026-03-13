import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument } from '~/utils';

export interface IScoreCampaign {
  title: string;
  description: string;
  add: {
    placeholder: string;
    currencyRatio: string;
  };
  subtract: {
    placeholder: string;
    currencyRatio: string;
  };
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
    IScoreCampaign {
  _id: string;
}

export interface DoCampaignTypes {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  target: any;
  targetId?: string;
  actionMethod: 'add' | 'subtract';
  serviceName?: string;
}

export interface IScoreCampaignParams extends ICursorPaginateParams {
  status?: string;
  searchValue?: string;
  serviceName?: string;
}
