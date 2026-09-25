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
  targetActionId?: string;
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

export interface IAutomationWorkflow {
  id: string;
  // Empty for converted (containment) workflows that own their actions;
  // set when the node references another automation.
  automationId?: string;
  // Source template when inserted from one
  templateId?: string;
  name: string;
  description?: string;
  nextActionId?: string;
  config?: {
    entryActionId?: string;
    // name -> default binding expression, e.g. { customerId: "{{ trigger.customerId }}" }
    inputs?: Record<string, string>;
    [key: string]: any;
  };
  actions?: IAutomationAction[];
  icon?: string;
  position?: any;
}

export interface IAutomationNote {
  id: string;
  content: string;
  position?: any;
  width?: number;
  height?: number;
  color?: string;
}

export interface IAutomation {
  name: string;
  status: TAutomationStatus;
  edgeType?: string;
  flowDirection?: string;
  triggers: IAutomationTrigger[];
  actions: IAutomationAction[];
  workflows?: IAutomationWorkflow[];
  // Canvas annotations. Deliberately outside actions so the executor and the
  // builder's flow validation never see them.
  notes?: IAutomationNote[];
  /**
   * Set when another module owns this automation and drives its lifecycle, so
   * it stays out of the automations list the way an automation-owned segment
   * stays out of the segments list. Never set through `automationsEdit`.
   */
  ownedBy?: 'broadcast';
  ownerContentId?: string;
  duplicatedFrom?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  /**
   * Whose automation this is: the records it creates are made on this
   * person's behalf. Taken by whoever first puts it live, and moved only by
   * consent — never derived from who edited it last, because editing a flow
   * is not the same as answering for what it does.
   */
  ownerId?: string;
  /** Who last put it live, and when. Audit, not ownership. */
  activatedBy?: string;
  activatedAt?: Date;
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
    targetActionId: { type: String, optional: true },
  },
  { _id: false },
);

const workflowSchema = new Schema(
  {
    id: { type: String, required: true },
    // Empty for converted (containment) workflows that own their actions;
    // set when the node references another automation.
    automationId: { type: String },
    // Source template when inserted from one; lets edits offer to update it
    templateId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    nextActionId: { type: String },
    config: { type: Object },
    actions: { type: [actionSchema], optional: true },
    icon: { type: String, optional: true },
    position: { type: Object },
  },
  { _id: false },
);

const noteSchema = new Schema(
  {
    id: { type: String, required: true },
    content: { type: String, default: '' },
    position: { type: Object },
    width: { type: Number, optional: true },
    height: { type: Number, optional: true },
    color: { type: String, optional: true },
  },
  { _id: false },
);

export const automationSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, default: AUTOMATION_STATUSES.DRAFT },
  edgeType: { type: String, optional: true },
  flowDirection: { type: String, optional: true },
  triggers: { type: [triggerSchema] },
  actions: { type: [actionSchema] },
  workflows: { type: [workflowSchema] },
  notes: { type: [noteSchema], optional: true },
  ownedBy: { type: String, optional: true, label: 'Owned by' },
  ownerContentId: { type: String, optional: true, label: 'Owner content id' },
  duplicatedFrom: { type: String, optional: true },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created date',
  },
  createdBy: { type: String },
  updatedAt: { type: Date, default: new Date(), label: 'Updated date' },
  updatedBy: { type: String },
  ownerId: { type: String, label: 'Owner', optional: true },
  activatedBy: { type: String, optional: true },
  activatedAt: { type: Date, optional: true },
  tagIds: { type: [String], label: 'Tag Ids', optional: true },
});

automationSchema.index({ ownedBy: 1, ownerContentId: 1 });
