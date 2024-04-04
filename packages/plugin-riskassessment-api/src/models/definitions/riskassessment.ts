import { Document, Schema } from 'mongoose';
import { field } from './utils';

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
  permittedUserIds: string[];
  groupId: string;
  branchIds: string[];
  departmentIds: string[];
  operationIds: string[];
  indicatorGroups: any[];
  cardId: string;
  cardType: string;
  isSplittedUsers: boolean;
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

export const riskAssessmentIndicatorsSchema = new Schema({
  assessmentId: field({ type: String, label: 'Risk assessment Id' }),
  indicatorId: field({ type: String, label: 'Risk indicator Id' }),
  ...commonAssessmentSchema
});

export const riskAssessmentIndicatorsGroupsSchema = new Schema({
  assessmentId: field({ type: String, label: 'Risk assessment Id' }),
  groupId: field({ type: String, label: 'Risk indicator Id' }),
  assignedUserIds: field({
    type: [String],
    label: 'Assigned User Id',
    optional: true
  }),
  ...commonAssessmentSchema
});

export const riskAssessmentsSchema = new Schema({
  cardId: field({ type: String, label: 'Card Id' }),
  cardType: field({ type: String, label: 'Card Type' }),
  indicatorId: field({
    type: String,
    label: 'Risk indicator Id'
  }),
  permittedUserIds: field({
    type: [String],
    label: 'Permitted User Ids',
    optional: true,
    default: undefined
  }),
  groupId: field({ type: String, label: 'Indicator Group Id' }),
  isSplittedUsers: field({ type: Boolean, label: 'Is Splitted Team Members' }),
  branchId: field({ type: String, label: 'branchId', optional: true }),
  departmentId: field({ type: String, label: 'departmentId', optional: true }),
  operationId: field({ type: String, label: 'operationId', optional: true }),
  ...commonAssessmentSchema
});
