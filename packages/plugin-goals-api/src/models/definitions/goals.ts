import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IGoal {
  name: string;
  entity: string;
  stageId: string;
  pipelineId: string;
  boardId: string;
  contributionType: string;
  metric: string;
  goalTypeChoose: string;
  contribution?: string[];
  department: string[];
  unit: string[];
  branch: string[];
  chooseStage: string;
  specificPeriodGoals?: object;
  segmentIds: string[];
  startDate: Date;
  endDate: Date;
  stageRadio: boolean;
  segmentRadio: boolean;
  periodGoal: string;
  teamGoalType: string;
  segmentCount: number;
  pipelineLabels: object;
  productIds: string[];
  companyIds: string[];
  tagsIds: string[];
}

export interface IGoalDocument extends IGoal, Document {
  _id: string;
  createdAt: Date;
}

export const goalSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'name' }),
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
    metric: field({ type: String, label: 'Metric' }),
    goalTypeChoose: field({ type: String, label: 'Choose Goal Type' }),
    contribution: field({ type: [String], label: 'contribution' }),
    startDate: field({ type: Date, label: 'StartDate Durable' }),
    endDate: field({ type: Date, label: 'EndDate Durable' }),
    department: {
      type: [String],
      label: 'Department'
    },
    unit: {
      type: [String],
      label: 'Unit'
    },
    branch: {
      type: [String],
      label: 'Branch'
    },
    stageRadio: field({ type: Boolean, label: 'Stage check' }),
    segmentRadio: field({ type: Boolean, label: 'Segment check' }),
    segmentIds: field({ type: [String], label: 'Segment Data' }),
    periodGoal: field({ type: String, label: 'Period ' }),
    teamGoalType: field({ type: String, label: 'Choose  Structure' }),
    segmentCount: field({ type: Number, min: 0, label: 'segmentCount' }),
    pipelineLabels: field({ type: [Object], label: 'PipelineLabel' }),
    productIds: field({ type: [String], label: 'productIds' }),
    companyIds: field({ type: [String], label: 'companyIds' }),
    tagsIds: field({ type: [String], label: 'tagsIds' })
  }),
  'erxes_goals'
);

// for goals query. increases search speed, avoids in-memory sorting
goalSchema.index({ type: 1, IGoal: 1, name: 1 });
