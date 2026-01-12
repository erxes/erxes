import { Document } from 'mongoose';

export interface IScore {
  ownerId: string;
  ownerType: string;
  score: number;
}

export interface IScoreDocument extends IScore, Document {
  createdAt: Date;
  updatedAt: Date;
}
