import { Document, Schema } from 'mongoose';
import { AUTOMATION_STATUSES } from '../constants';

export type IAutomationActionsMap = { [key: string]: IAutomationAction };

// type for values
type TAutomationStatus =
  (typeof AUTOMATION_STATUSES)[keyof typeof AUTOMATION_STATUSES];

export interface IAutomationAction<TConfig = any> {
  id: string;
  type: string;
  nextActionId?: string;
  config?: TConfig;
  style?: any;
  icon?: string;
  label?: string;
  description?: string;
  workflowId?: string;
}

export interface IAutomationTrigger<TConfig = any> {
  id: string;
  type: string;
  actionId?: string;
  config: {
    contentId: string;
    reEnrollment: boolean;
    reEnrollmentRules: string[];
    dateConfig: any;
    [key: string]: any;
  } & TConfig;
  style?: any;
  icon?: string;
  label?: string;
  description?: string;
  isCustom?: boolean;
  workflowId?: string;
}

export interface IAutomation {
  name: string;
  status: TAutomationStatus;
  triggers: IAutomationTrigger[];
  actions: IAutomationAction[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  tagIds: string[];
}

export interface IAutomationDoc extends IAutomation {
  _id?: string;
}

export interface IAutomationDocument extends IAutomation, Document {
  _id: string;
}

const triggerSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    actionId: { type: String },
    config: { type: Object },
    style: { type: Object },
    position: { type: Object },
    icon: { type: String, optional: true },
    label: { type: String, optional: true },
    description: { type: String, optional: true },
    isCustom: { type: Boolean, optional: true },
    workflowId: { type: String, optional: true },
  },
  { _id: false },
);

const actionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    nextActionId: { type: String },
    config: { type: Object },
    style: { type: Object },
    position: { type: Object },
    icon: { type: String, optional: true },
    label: { type: String, optional: true },
    description: { type: String, optional: true },
    workflowId: { type: String, optional: true },
  },
  { _id: false },
);

const workflowSchema = new Schema(
  {
    id: { type: String, required: true },
    automationId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    config: { type: Object },
    position: { type: Object },
  },
  { _id: false },
);

export const automationSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, default: AUTOMATION_STATUSES.DRAFT },
  triggers: { type: [triggerSchema] },
  actions: { type: [actionSchema] },
  workflows: { type: [workflowSchema] },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created date',
  },
  createdBy: { type: String },
  updatedAt: { type: Date, default: new Date(), label: 'Updated date' },
  updatedBy: { type: String },
  tagIds: { type: [String], label: 'Tag Ids', optional: true },
});
