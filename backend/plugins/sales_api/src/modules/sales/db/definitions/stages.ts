import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { PROBABILITY, SALES_STATUSES, VISIBILITIES } from '../../constants';

export const stageSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name' },
    probability: {
      type: String,
      enum: PROBABILITY.ALL,
      label: 'Probability',
    },
    pipelineId: { type: String, label: 'Pipeline' },
    formId: { type: String, label: 'Form' },
    status: {
      type: String,
      enum: SALES_STATUSES.ALL,
      default: SALES_STATUSES.ACTIVE,
    },
    visibility: {
      type: String,
      enum: VISIBILITIES.ALL,
      default: VISIBILITIES.PUBLIC,
      label: 'Visibility',
    },
    code: {
      type: String,
      label: 'Code',
      optional: true,
    },
    age: { type: Number, optional: true, label: 'Age' },
    memberIds: { type: [String], label: 'Members' },
    canMoveMemberIds: { type: [String], label: 'Can move members' },
    canEditMemberIds: { type: [String], label: 'Can edit members' },
    departmentIds: { type: [String], label: 'Departments' },
    defaultTick: {
      type: Boolean,
      label: 'Default tick used',
      optional: true,
    },
    userId: { type: String, label: 'Created by' },
    order: { type: Number, label: 'Order' },
    type: {
      type: String,
      required: true,
      label: 'Type',
      default: 'deal',
    },
  },
  {
    timestamps: true,
  },
);
