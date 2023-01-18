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

type IIndicatorForms = {
  _id: string;
  formId: string;
  calculateMethod: string;
  percentWeight?: number;
  calculateLogics: ICalculateLogics[];
};
export interface IRiskIndicatorsDocument extends Document {
  _id: string;
  createdAt: Date;
  name: String;
  description: String;
  categoryIds: [String];
  departmentIds: [String];
  branchIds: [String];
  status: String;
  forms?: IIndicatorForms[];
}

export interface IRiskIndicatorsConfigsDocument extends Document {
  _id: String;
  boardId: String;
  pipelineId: String;
  stageId?: String;
  customFieldId?: String;
  configs: any[];
  riskIndicatorId?: String;
}

const calculateLogicsSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Logic Name' }),
  value: field({ type: Number, label: 'Logic Value' }),
  value2: field({ type: Number, label: 'Logic Value When Between Logic' }),
  logic: field({ type: String, label: 'Logic Logic' }),
  color: field({ type: String, label: 'Logic Status Color' })
});

const riskIndicatorFormsSchema = new Schema({
  _id: field({ pkey: true }),
  formId: field({ type: String, name: 'Form ID' }),
  calculateMethod: field({ type: String, label: 'Calculate Method' }),
  percentWeight: field({ type: Number, label: 'Percent Weight' }),
  calculateLogics: field({
    type: [calculateLogicsSchema],
    label: 'Calculate Logics'
  })
});

const customScoreField = new Schema(
  {
    label: field({ type: String, label: 'Custom Score Field Label' }),
    percentWeigth: field({
      type: Number,
      label: 'Custom Score Field Percent Weigth'
    })
  },
  { _id: false }
);

export const riskIndicatorSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  createdAt: field({ type: Date, default: Date.now, label: 'Created At' }),
  categoryIds: field({ type: [String], label: 'Risk Assessment Category Ids' }),
  branchIds: field({ type: [String], label: ' BranchIDs' }),
  departmentIds: field({ type: [String], label: 'DepartmentIDs' }),
  customScoreField: { type: customScoreField, label: 'Custom Score Field' },
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
    type: [riskIndicatorFormsSchema],
    label: 'Risk Assessment Forms'
  })
});

const riskIndicatorConfigsFieldsSchema = new Schema({
  _id: field({ pkey: true }),
  value: field({ type: String, label: 'Field Value' }),
  label: field({ type: String, label: 'Field Label' }),
  riskIndicatorId: field({
    type: String,
    label: 'Field Config Risk assessment ID'
  })
});

export const riskIndicatorConfigsSchema = new Schema({
  _id: field({ pkey: true }),
  cardType: field({ type: String, label: 'Card Type' }),
  boardId: field({ type: String, label: 'Board Id' }),
  pipelineId: field({ type: String, label: 'Pipeline Id' }),
  stageId: field({ type: String, label: 'Stage Id', optional: true }),
  riskIndicatorId: field({
    type: String,
    optional: true,
    label: 'Risk assessment ID'
  }),
  customFieldId: field({ type: String, label: 'Custom Field Id' }),
  configs: field({
    type: [riskIndicatorConfigsFieldsSchema],
    label: 'Custom Field Config'
  }),
  createdAt: field({ type: Date, label: 'Created At', default: new Date() }),
  modifiedAt: field({ type: Date, label: 'Modified At', default: new Date() })
});
