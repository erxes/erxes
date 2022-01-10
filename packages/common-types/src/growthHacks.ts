import { Document } from 'mongoose';

import { IItemCommonFields } from './boards';

export interface IGrowthHack extends IItemCommonFields {
  voteCount?: number;
  votedUserIds?: string[];

  hackStages?: string;
  reach?: number;
  impact?: number;
  confidence?: number;
  ease?: number;
}

export interface IGrowthHackDocument extends IGrowthHack, Document {
  _id: string;
}
