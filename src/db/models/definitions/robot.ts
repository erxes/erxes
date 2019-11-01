import { Document, Schema } from 'mongoose';
import { field } from './utils';

// entry ====================
export interface IRobotEntry {
  parentId?: string;
  isNotified: boolean;
  action: string;
  data: object;
}

export interface IRobotEntryDocument extends IRobotEntry, Document {
  _id: string;
}

export const robotEntrySchema = new Schema({
  _id: field({ pkey: true }),
  parentId: field({ type: String, optional: true }),
  isNotified: field({ type: Boolean, default: false }),
  action: field({ type: String }),
  data: field({ type: Object }),
});

// onboarding history ====================
export interface IOnboardingHistory {
  userId: string;
  totalPoint: number;
  isCompleted: boolean;
  completedSteps: string[];
}

export interface IOnboardingHistoryDocument extends IOnboardingHistory, Document {
  _id: string;
}

export const onboardingHistorySchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String }),
  totalPoint: field({ type: Number }),
  isCompleted: field({ type: Boolean }),
  completedSteps: field({ type: [String] }),
});
