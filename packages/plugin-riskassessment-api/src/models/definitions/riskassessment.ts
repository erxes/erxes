import { Document, Schema } from 'mongoose';
import { field } from './utils';

type ICalculateLogics = {
  _id: string;
  name: string;
  value: string;
  value2?: string;
  logic: string;
  color: string;
};

type IRiskAssessmentForms = {
  _id: string;
  formId: string;
  calculateMethod: string;
  percentWeight?: number;
  calculateLogics: ICalculateLogics[];
};
export interface IRiskAssessmentDocument extends Document {
  _id: string;
  createdAt: Date;
  name: String;
  description: String;
  categoryIds: [String];
  departmentIds: [String];
  branchIds: [String];
  status: String;
  forms?: IRiskAssessmentForms[];
}

export interface IRiskAssessmentCategoryDocument extends Document {
  _id: String;
  name: String;
  parentId: String;
  order: String;
  code: String;
}

export interface IRiskAssessmentsConfigDocument extends Document {
  _id: String;
  boardId: String;
  pipelineId: String;
  stageId?: String;
  customFieldId?: String;
  configs: any[];
  riskAssessmentId?: String;
}

export const riskAssessmentCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Category Name' }),
  parentId: field({ type: String, label: 'Category Parent Name' }),
  order: field({ type: String, label: 'Category Order' }),
  code: field({ type: String, label: 'Category Code' }),
  type: field({ type: String, label: 'Category Type' })
});

const calculateLogicsSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Logic Name' }),
  value: field({ type: Number, label: 'Logic Value' }),
  value2: field({ type: Number, label: 'Logic Value When Between Logic' }),
  logic: field({ type: String, label: 'Logic Logic' }),
  color: field({ type: String, label: 'Logic Status Color' })
});

const riskAssessmentFormsSchema = new Schema({
  _id: field({ pkey: true }),
  formId: field({ type: String, name: 'Form ID' }),
  calculateMethod: field({ type: String, label: 'Calculate Method' }),
  percentWeight: field({ type: Number, label: 'Percent Weight' }),
  calculateLogics: field({
    type: [calculateLogicsSchema],
    label: 'Calculate Logics'
  })
});

export const riskAssessmentSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  createdAt: field({ type: Date, default: Date.now, label: 'Created At' }),
  categoryIds: field({ type: [String], label: 'Risk Assessment Category Ids' }),
  branchIds: field({ type: [String], label: ' BranchIDs' }),
  departmentIds: field({ type: [String], label: 'DepartmentIDs' }),
  calculateMethod: field({
    type: String,
    optional: true,
    label: 'Calculate Method'
  }),
  calculateLogics: field({
    type: [calculateLogicsSchema],
    optinal: true,
    label: 'Calculate Logics'
  }),
  forms: field({
    type: [riskAssessmentFormsSchema],
    label: 'Risk Assessment Forms'
  })
});

const riskAssessmentFieldsConfigsSchema = new Schema({
  _id: field({ pkey: true }),
  value: field({ type: String, label: 'Field Value' }),
  label: field({ type: String, label: 'Field Label' }),
  riskAssessmentId: field({
    type: String,
    label: 'Field Config Risk assessment ID'
  })
});

export const riskAssessmentConfigsSchema = new Schema({
  _id: field({ pkey: true }),
  cardType: field({ type: String, label: 'Card Type' }),
  boardId: field({ type: String, label: 'Board Id' }),
  pipelineId: field({ type: String, label: 'Pipeline Id' }),
  stageId: field({ type: String, label: 'Stage Id', optional: true }),
  riskAssessmentId: field({
    type: String,
    optional: true,
    label: 'Risk assessment ID'
  }),
  customFieldId: field({ type: String, label: 'Custom Field Id' }),
  configs: field({
    type: [riskAssessmentFieldsConfigsSchema],
    label: 'Custom Field Config'
  }),
  createdAt: field({ type: Date, label: 'Created At', default: new Date() }),
  modifiedAt: field({ type: Date, label: 'Modified At', default: new Date() })
});
