import { Schema } from 'mongoose';

export interface IAutomationWaitingAction {
  automationId: string;
  executionId: string;
  currentActionId: string;
  responseActionId: string;
  conditionType: 'isInSegment' | 'checkObject';
  conditionConfig: any;
  lastCheckedAt: Date;
}

export interface IAutomationWaitingActionDocument
  extends IAutomationWaitingAction,
    Document {
  _id: string;
}

export const waitingActionsToExecuteSchema = new Schema(
  {
    automationId: { type: String, required: true, index: true },
    executionId: { type: String, required: true, index: true },
    currentActionId: {
      type: String,
      required: true,
    },
    responseActionId: {
      type: String,
    },
    conditionType: {
      type: String,
      enum: ['isInSegment', 'checkObject'],
      required: true,
      index: true,
    },
    conditionConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    lastCheckedAt: Date,
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);
