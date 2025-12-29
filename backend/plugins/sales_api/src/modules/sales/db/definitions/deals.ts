import {
  attachmentSchema,
  customFieldSchema,
} from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { SALES_STATUSES, TIME_TRACK_TYPES } from '../../constants';

export const productDataSchema = new Schema(
  {
    _id: { type: String },
    productId: { type: String, esType: 'keyword' }, // Product
    name: { type: String, esType: 'name' }, // Product name
    uom: { type: String, esType: 'keyword' }, // Units of measurement
    currency: { type: String, esType: 'keyword' }, // Currency
    quantity: { type: Number, label: 'Quantity' }, // Quantity
    maxQuantity: { type: Number, label: 'Max' }, // Max quantity when selected bonus voucher
    unitPrice: { type: Number, label: 'Unit price' }, // Unit price
    globalUnitPrice: { type: Number, label: 'Global unit price' }, // Global unit price
    unitPricePercent: { type: Number, label: 'Unit price percent' }, // Unit price percent
    taxPercent: { type: Number, label: 'Tax percent' }, // Tax percent
    vatPercent: { type: Number, label: 'Vat percent' }, // Vat percent
    tax: { type: Number, label: 'Tax' }, // Tax
    discountPercent: { type: Number, label: 'Discount percent' }, // Discount percent
    discount: { type: Number, label: 'Discount' }, // Discount
    bonusCount: { type: Number, label: 'Bonus Count' }, // Bonus Count
    amount: { type: Number, label: 'Amount' }, // Amount
    tickUsed: { type: Boolean, label: 'Tick used' }, // TickUsed
    isVatApplied: { type: Boolean, label: 'Is vat applied' }, // isVatApplied
    assignUserId: { type: String, optional: true, esType: 'keyword' }, // AssignUserId
    branchId: { type: String, optional: true, esType: 'keyword' },
    departmentId: { type: String, optional: true, esType: 'keyword' },
    startDate: { type: Date, optional: true, label: 'Start date' }, //pms
    endDate: { type: Date, optional: true, label: 'End date' }, //pms
    information: { type: Object, optional: true, label: 'information' }, //pms
  },
  { _id: false },
);

const timeTrackSchema = new Schema(
  {
    startDate: { type: String },
    timeSpent: { type: Number },
    status: {
      type: String,
      enum: TIME_TRACK_TYPES.ALL,
      default: TIME_TRACK_TYPES.STOPPED,
    },
  },
  { _id: false },
);

const relationSchema = new Schema(
  {
    id: { type: String },
    start: { type: String },
    end: { type: String },
  },
  { _id: false },
);

export const dealSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      parentId: { type: String, optional: true, label: 'Parent Id' },
      userId: { type: String, optional: true, esType: 'keyword' },
      order: { type: Number, index: true },
      name: { type: String, optional: true, label: 'Name' },
      startDate: { type: Date, label: 'Start date', esType: 'date' },
      closeDate: { type: Date, label: 'Close date', esType: 'date' },
      stageChangedDate: {
        type: Date,
        label: 'Stage changed date',
        esType: 'date',
      },
      reminderMinute: { type: Number, label: 'Reminder minute' },
      isComplete: {
        type: Boolean,
        default: false,
        label: 'Is complete',
        esType: 'boolean',
      },
      description: { type: String, optional: true, label: 'Description' },
      assignedUserIds: { type: [String], esType: 'keyword' },
      watchedUserIds: { type: [String], esType: 'keyword' },
      labelIds: { type: [String], esType: 'keyword' },
      attachments: { type: [attachmentSchema], label: 'Attachments' },
      stageId: { type: String, index: true },
      initialStageId: {
        type: String,
        optional: true,
      },
      modifiedBy: { type: String, esType: 'keyword' },
      searchText: { type: String, optional: true, index: true },
      priority: { type: String, optional: true, label: 'Priority' },
      // TODO remove after migration
      sourceConversationId: { type: String, optional: true },
      sourceConversationIds: { type: [String], optional: true },
      timeTrack: {
        type: timeTrackSchema,
      },
      status: {
        type: String,
        enum: SALES_STATUSES.ALL,
        default: SALES_STATUSES.ACTIVE,
        label: 'Status',
        index: true,
      },
      customFieldsData: {
        type: [customFieldSchema],
        optional: true,
        label: 'Custom fields data',
      },
      score: {
        type: Number,
        optional: true,
        label: 'Score',
        esType: 'number',
      },
      number: {
        type: String,
        unique: true,
        sparse: true,
        label: 'Item number',
      },
      relations: {
        type: [relationSchema],
        optional: true,
        label: 'Related items used for gantt chart',
      },
      tagIds: {
        type: [String],
        optional: true,
        index: true,
        label: 'Tags',
      },
      branchIds: {
        type: [String],
        optional: true,
        index: true,
        label: 'Branches',
      },
      departmentIds: {
        type: [String],
        optional: true,
        index: true,
        label: 'Departments',
      },

      productsData: { type: [productDataSchema], label: 'Products' },
      totalAmount: { type: Number, label: 'Total Amount', index: true },
      unUsedTotalAmount: { type: Number, label: 'UnUsed TotalAmount' },
      bothTotalAmount: { type: Number, label: 'Both Total Amount' },
      paymentsData: { type: Object, optional: true, label: 'Payments' },
      extraData: { type: Object, optional: true },
    },
    {
      timestamps: true,
    },
  ),
);
