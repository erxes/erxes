import { Document } from 'mongoose';

export interface IGoal {
  name: string;
  entity: string;
  stageId?: string;
  pipelineId?: string;
  boardId?: string;
  contributionType: string;
  metric: string;
  goalTypeChoose: string;
  contribution?: string[];
  department: string[];
  unit: string[];
  branch: string[];
  chooseStage: string;
  specificPeriodGoals?:  any[];
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
