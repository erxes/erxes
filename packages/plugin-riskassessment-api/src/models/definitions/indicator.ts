import { Document, Schema } from 'mongoose';
import { commonAssessmentSchema } from './riskassessment';
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
  name: string;
  description: string;
  categoryId: [string];
  departmentIds: [string];
  branchIds: [string];
  operationIds: [string];
  status: string;
  calculateLogics?: ICalculateLogics[];
  calculateMethod?: string;
  customScoreField: { label: string; percentWeight: number }[];
  forms?: IIndicatorForms[];
}

export interface IRiskIndicatorsConfigsDocument extends Document {
  _id: string;
  boardId: string;
  pipelineId: string;
  stageId?: string;
  customFieldId?: string;
  configs: any[];
  riskIndicatorId?: string;
  indicatorsGroupId?: string;
}

export interface IIndicatorsGroupDocument extends Document {
  indicatorIds: string[];
  percentWeight?: number;
  calculateLogics: ICalculateLogics[];
  calculateMethod: string;
}

export interface IIndicatorsGroupsDocument extends Document {
  _id: string;
  code: string;
  order: string;
  calculateMethod: string;
  calculateLogics: ICalculateLogics[];
  groups: IIndicatorsGroupDocument[];
}

export const calculateMethodsSchema = new Schema({
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
  calculateLogics: field({
    type: [calculateMethodsSchema],
    label: 'calculate logic',
    optional: true
  }),
  percentWeight: field({ type: Number, label: 'Percent Weight' })
});

const customScoreField = new Schema(
  {
    label: field({ type: String, label: 'Custom Score Field Label' }),
    percentWeight: field({
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
  categoryId: field({ type: String, label: 'CategoryId' }),
  operationIds: field({ type: [String], label: 'OperationIDs' }),
  branchIds: field({ type: [String], label: ' BranchIDs' }),
  departmentIds: field({ type: [String], label: 'DepartmentIDs' }),
  customScoreField: { type: customScoreField, label: 'Custom Score Field' },
  calculateMethod: field({
    type: String,
    optional: true,
    label: 'Calculate Method'
  }),
  calculateLogics: field({
    type: [calculateMethodsSchema],
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
    label: 'Field Config Risk indicator Id'
  }),
  indicatorsGroupId: field({
    type: String,
    label: 'Field Config Risk Indicators Group Id'
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
    label: 'Risk indicator id'
  }),
  indicatorsGroupId: field({
    type: String,
    optional: true,
    label: 'Risk indicators group id'
  }),
  customFieldId: field({ type: String, label: 'Custom Field Id' }),
  configs: field({
    type: [riskIndicatorConfigsFieldsSchema],
    label: 'Custom Field Config'
  }),
  createdAt: field({ type: Date, label: 'Created At', default: new Date() }),
  modifiedAt: field({ type: Date, label: 'Modified At', default: new Date() })
});

const indicatorGroupsSchema = new Schema({
  _id: field({ pkey: true }),
  indicatorIds: field({ type: [String], label: 'IndicatorIds' }),
  percentWeight: field({
    type: Number,
    label: 'Percent Weight',
    optional: true
  }),
  calculateMethod: field({ type: String, labels: 'Calculate Method' }),
  calculateLogics: field({
    type: [calculateMethodsSchema],
    labels: 'indicator groups calculate methods'
  })
});

export const riskIndicatorGroupSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  calculateMethod: field({ type: String, label: 'Calculate Method' }),
  calculateLogics: field({
    type: [calculateMethodsSchema],
    label: 'Calculate Logics'
  }),
  groups: field({ type: [indicatorGroupsSchema], label: 'indicators groups' }),
  createdAt: field({ type: Date, label: 'Created At', default: Date.now }),
  modifiedAt: field({ type: Date, label: 'Modified At', default: Date.now })
});
