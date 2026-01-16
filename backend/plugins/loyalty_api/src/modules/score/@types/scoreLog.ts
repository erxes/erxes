import { Document } from 'mongoose';

export interface IScoreLog {
  ownerId: string;
  ownerType: string;

  campaignId: string;

  description: string;

  action: string;
  change: number;

  contentId: string;
  contentType: string;

  createdBy: string;
}

export interface IScoreLogDocument extends IScoreLog, Document {
  createdAt: Date;
  updatedAt: Date;
}
