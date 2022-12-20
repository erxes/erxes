import { Document, Schema } from 'mongoose';
import { field } from './utils';
export interface IRiskAssessmentDocument extends Document {
  _id: string;
  createdAt: Date;
  name: String;
  description: String;
  categoryId: String;
  status: String;
}

export interface IRiskAssessmentCategoryDocument extends Document {
  _id: String;
  name: String;
  formId: String;
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
  formId: field({ type: String, label: 'Category Form Id' }),
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

export const riskAssessmentSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  createdAt: field({ type: Date, default: Date.now, label: 'Created At' }),
  categoryId: field({ type: String, label: 'Risk Assessment Category Id' }),
  calculateMethod: field({ type: String, label: 'Calculate Method' }),
  calculateLogics: field({
    type: [calculateLogicsSchema],
    label: 'Calculate Logics'
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
