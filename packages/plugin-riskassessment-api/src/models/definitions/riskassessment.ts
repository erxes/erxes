import { Document, Schema } from 'mongoose';
import { calculateMethodsSchema } from './indicator';
import { field } from './utils';

export interface IRiskAssessmentCategoryDocument extends Document {
  _id: String;
  name: String;
  parentId: String;
  order: String;
  code: String;
}

interface AssessmentCommonTypes {
  status: string;
  statusColor: string;
  resultScore: number;
  createdAt: string;
  cloesedAt: string;
}

export interface IRiskAssessmentsDocument
  extends AssessmentCommonTypes,
    Document {
  _id: string;
  indicatorId: string[];
  groupId: string;
  branchIds: string[];
  departmentIds: string[];
  operationIds: string[];
  indicatorGroups: any[];
  cardId: string;
  cardType: string;
}

export interface IRiskAssessmentIndicator
  extends AssessmentCommonTypes,
    Document {
  assetId: string;
  indicatorId: string;
  status: string;
  statusColor: string;
  resultScore: number;
  totalScore: number;
}

export interface IRiskAssessmentIndicatorsDocument
  extends IRiskAssessmentIndicator {
  _id: string;
}

export const commonAssessmentSchema = {
  _id: field({ pkey: true }),
  status: field({ type: String, label: 'Status', default: 'In Progress' }),
  statusColor: field({
    type: String,
    label: 'Status Status Color',
    default: '#3B85F4'
  }),
  resultScore: field({ type: Number, label: 'Result Score', default: 0 }),
  totalScore: field({ type: Number, label: 'Total Score', default: 0 }),
  createdAt: field({ type: Date, label: 'Created At', default: Date.now }),
  closedAt: field({ type: Date, optional: true, label: 'Closed At' })
};

export const riskAssessmentCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Category Name' }),
  parentId: field({ type: String, label: 'Category Parent Name' }),
  order: field({ type: String, label: 'Category Order' }),
  code: field({ type: String, label: 'Category Code' }),
  type: field({ type: String, label: 'Category Type' })
});

export const riskAssessmentIndicatorsSchema = new Schema({
  assessmentId: field({ type: String, label: 'Risk assessment Id' }),
  indicatorId: field({ type: String, label: 'Risk indicator Id' }),
  ...commonAssessmentSchema
});

export const riskAssessmentIndicatorsGroupsSchema = new Schema({
  assessmentId: field({ type: String, label: 'Risk assessment Id' }),
  groupId: field({ type: String, label: 'Risk indicator Id' }),
  ...commonAssessmentSchema
});

export const riskAssessmentsSchema = new Schema({
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  indicatorId: field({
    type: String,
    label: 'Risk indicator Id'
  }),
  groupId: field({ type: String, label: 'Indicator Group Id' }),
  branchIds: field({ type: [String], label: 'Branch ids ' }),
  departmentIds: field({ type: [String], label: 'Department ids ' }),
  operationIds: field({ type: [String], label: 'Operation Ids' }),
  ...commonAssessmentSchema
});
