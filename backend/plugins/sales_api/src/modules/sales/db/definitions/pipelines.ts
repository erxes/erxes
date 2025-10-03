import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import {
  HACK_SCORING_TYPES,
  SALES_STATUSES,
  VISIBILITIES,
} from '../../constants';

export const pipelineSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name' },
    boardId: { type: String, label: 'Board' },
    tagId: {
      type: String,
      optional: true,
      label: 'Tags',
    },
    status: {
      type: String,
      enum: SALES_STATUSES.ALL,
      default: SALES_STATUSES.ACTIVE,
      label: 'Status',
    },
    visibility: {
      type: String,
      enum: VISIBILITIES.ALL,
      default: VISIBILITIES.PUBLIC,
      label: 'Visibility',
    },
    watchedUserIds: { type: [String], label: 'Watched users' },
    memberIds: { type: [String], label: 'Members' },
    bgColor: { type: String, label: 'Background color' },
    // Growth hack
    startDate: { type: Date, optional: true, label: 'Start date' },
    endDate: { type: Date, optional: true, label: 'End date' },
    metric: { type: String, optional: true, label: 'Metric' },
    hackScoringType: {
      type: String,
      enum: HACK_SCORING_TYPES.ALL,
      label: 'Hacking scoring type',
    },
    templateId: { type: String, optional: true, label: 'Template' },
    isCheckDate: {
      type: Boolean,
      optional: true,
      label: 'Select the day after the card created date',
    },
    isCheckUser: {
      type: Boolean,
      optional: true,
      label: 'Show only the users created or assigned cards',
    },
    isCheckDepartment: {
      type: Boolean,
      optional: true,
      label: 'Show only the departments created or assigned cards',
    },
    excludeCheckUserIds: {
      type: [String],
      optional: true,
      label: 'Users elligible to see all cards',
    },
    numberConfig: { type: String, optional: true, label: 'Number config' },
    numberSize: { type: String, optional: true, label: 'Number count' },
    nameConfig: { type: String, optional: true, label: 'Name config' },

    lastNum: {
      type: String,
      optional: true,
      label: 'Last generated number',
    },
    departmentIds: {
      type: [String],
      optional: true,
      label: 'Related departments',
    },
    branchIds: {
      type: [String],
      optional: true,
      label: 'Related branches',
    },
    initialCategoryIds: {
      type: [String],
      label: 'Pos initial categories',
    },
    excludeCategoryIds: {
      type: [String],
      label: 'product exclude categories',
    },
    excludeProductIds: {
      type: [String],
      label: 'exclude products',
    },
    paymentIds: { type: [String], label: 'Online Payments' },
    paymentTypes: { type: [Object], label: 'Other Payments' },
    erxesAppToken: { type: String, label: 'Erxes App token' },

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
