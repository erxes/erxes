import { Document, Schema } from 'mongoose';
import { field } from './utils';

export const SCORE_CAMPAIGN_STATUSES = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

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
  createdAt: Date;
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

export interface IScoreCampaignDocuments extends Document, IScoreCampaign {
  _id: string;
}
