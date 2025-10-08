import { Document, Schema } from 'mongoose';
import { OWNER_TYPES } from './constants';
import { field } from './utils';

export interface IScoreLog {
  ownerType: string;
  ownerId: string;
  ownerIds?: string[];
  changeScore: number;
  description: string;
  createdBy?: string;
  campaignId?: string;
  serviceName?: string;
  sourceScoreLogId?: string;
  targetId?: string;
  action?: string;
}

export interface IScoreLogDocument extends IScoreLog, Document {
  _id: string;
  createdAt: Date;
}
