import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISpecificPeriodGoals {
  monthly: Date;
  target: string;
  progress: any;
}

export interface IGoal {
  entity: string;
  stageId: string;
  pipelineId: string;
  boardId: string;
  contributionType: string;
  frequency: string;
  metric: string;
  goalType: string;
  contribution?: string[];
  department: string;
  unit: string;
  branch: string;
  chooseStage: string;
  specificPeriodGoals?: ISpecificPeriodGoals[];
  startDate: string;
  endDate: string;
  target: string;
  progress: any;
}

export interface IGoalDocument extends IGoal, Document {
  _id: string;
  createdAt: Date;
}

export const goalSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    entity: field({ type: String, label: 'Choose Entity' }),
    contributionType: field({
      type: String,
      label: 'Contribution Type'
    }),
    specificPeriodGoals: field({
      type: Object,
      optional: true,
      label: 'Specific Period Goals'
    }),

    stageId: field({ type: String, label: 'stageId' }),
    pipelineId: field({ type: String, label: 'pipelineId' }),
    boardId: field({ type: String, label: 'boardId' }),
    frequency: field({ type: String, label: 'Frequency' }),
    metric: field({ type: String, label: 'Metric' }),
    goalType: field({ type: String, label: 'Choose Goal Type' }),
    contribution: field({ type: [String], label: 'contribution' }),
    startDate: field({ type: String, lable: 'StartDate Durable' }),
    endDate: field({ type: String, label: 'EndDate Durable' }),
    target: field({ type: String, label: 'Target' }),
    progress: {
      type: Object,
      label: 'Progress'
    },
    department: {
      type: String,
      label: 'Department'
    },
    unit: {
      type: String,
      label: 'Unit'
    },
    branch: {
      type: String,
      label: 'Branch'
    }
  }),
  'erxes_goals'
);

// for goals query. increases search speed, avoids in-memory sorting
goalSchema.index({ type: 1, IGoal: 1, name: 1 });
