import { Document } from 'mongoose';

export interface IScore {
  name?: string;
}

export interface IScoreDocument extends IScore, Document {
  createdAt: Date;
  updatedAt: Date;
}
