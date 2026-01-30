import { Document } from 'mongoose';

/**
 * Score action config (add / subtract)
 */
export interface IScoreActionConfig {
  placeholder: string;
  currencyRatio: number;
}

/**
 * Score campaign base fields
 */
export interface IScoreCampaign {
  name: string;
  description?: string;

  status?: string;
  ownerType: string;

  fieldGroupId?: string;
  fieldName?: string;
  fieldId?: string;

  add?: IScoreActionConfig;
  subtract?: IScoreActionConfig;

  onlyClientPortal?: boolean;
  restrictions?: any;
  additionalConfig?: any;

  createdBy?: string;
  updatedBy?: string;
}

/**
 * Score campaign mongoose document
 */
export interface IScoreCampaignDocument
  extends IScoreCampaign,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
