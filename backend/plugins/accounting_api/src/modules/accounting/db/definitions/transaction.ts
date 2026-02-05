import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { JOURNALS, PTR_STATUSES, TR_DETAIL_FOLLOW_TYPES, TR_FOLLOW_TYPES, TR_SIDES, TR_STATUSES } from '../../@types/constants';

export const transactionDetailSchema = new Schema({
  _id: mongooseStringRandomId,
  accountId: { type: String, label: 'Account', index: true },

  followInfos: {
    type: Object, label: 'Follower tr detail input'
  },

  originId: { type: String, optional: true, label: 'Source Transaction' },
  originType: { type: String, optional: true, label: 'This follow Type', enum: TR_DETAIL_FOLLOW_TYPES.ALL },
  originSubId: { type: String, optional: true, label: 'Source Sub Transaction' }, // double list

  side: {
    type: String,
    enum: TR_SIDES.ALL,
    label: 'Side',
    default: 'new',
    index: true,
  },
  amount: { type: Number, label: 'Amount' },
  currency: { type: String, optional: true, label: 'Currency' },
  currencyAmount: { type: Number, optional: true, label: 'CurrencyAmount' },
  customRate: { type: Number, optional: true, label: 'CustomRate' },

  assignUserId: { type: String, optional: true, esType: 'keyword' }, // AssignUserId

  productId: { type: String, optional: true, label: 'Product' },
  count: { type: Number, optional: true, label: 'Count' },
  unitPrice: { type: Number, optional: true, label: 'unitPrice' },
});

export const transactionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    date: { type: Date, label: 'Date' },
    fullDate: { type: Date, index: true, label: 'Date' },
    description: { type: String, optional: true, label: 'Description' },
    status: {
      type: String,
      enum: TR_STATUSES.ALL,
      label: 'Status',
      default: 'real',
      index: true,
    },
    ptrId: { type: String, label: 'Group', index: true },
    parentId: { type: String, optional: true, label: 'Parent ID', index: true },
    number: { type: String, optional: true, label: 'Number', index: true },
    journal: {
      type: String,
      enum: JOURNALS.ALL,
      default: 'zero',
      label: 'Journal',
      index: true
    },
    ptrStatus: {
      type: String,
      enum: PTR_STATUSES.ALL,
      default: 'zero',
      label: 'PTR Status',
      optional: true,
      index: true,
    },

    followInfos: { // Үндсэн бичилт үед ашиглагдана, Дагалдах бичилтүүдийн мэдээлэл байна
      type: Object, label: 'Follower transactions'
    },

    originId: { type: String, optional: true, label: 'Source Transaction' }, // Дагалдах бичилт үед л ашиглагдана, Үндсэн бичилтийн айд
    originSubId: { type: String, optional: true, label: 'Source Sub Transaction' }, // Дагалдах бичилт үед л ашиглагдана, Үндсэн бичилтийн дэд листээс хамаарсан бол ашиглагдана. Жишээлбэл барааны орлогын зардал бүрээс хамаарсан олон бичилт үүсэх бол
    originType: { type: String, optional: true, label: 'This follow Type', enum: TR_FOLLOW_TYPES.ALL }, // Дагалдах бичилт үед л ашиглагдана, Уг бичилтийн үндсэн бичилтэд хавсарч буй үүрэг буюу төрөл

    preTrId: { type: String, optional: true, label: 'previous transaction', index: true },

    branchId: { type: String, optional: true, label: 'Branch' },
    departmentId: { type: String, optional: true, label: 'Department' },
    customerType: { type: String, optional: true, label: 'Customer type' },
    customerId: { type: String, optional: true, label: 'Customer' },
    assignedUserIds: { type: [String], label: 'Assign Users' },

    details: { type: [transactionDetailSchema], label: 'details' },
    shortDetail: { type: transactionDetailSchema, label: 'short detail' },
    sumDt: { type: Number, label: 'sumDt' },
    sumCt: { type: Number, label: 'sumCt' },

    createdBy: { type: String, label: 'Created user' },
    modifiedBy: { type: String, optional: true, label: 'Modified user' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    updatedAt: { type: Date, optional: true, label: 'Modified at' },

    // vat 
    hasVat: { type: Boolean, optional: true, label: 'hasVat' },
    vatRowId: { type: String, optional: true, label: 'vatRowId' },
    afterVat: { type: Boolean, optional: true, label: 'afterVat' },
    afterVatAccountId: { type: String, optional: true, label: 'afterVatAccountId' },
    isHandleVat: { type: Boolean, optional: true, label: 'isHandleVat' },
    vatAmount: { type: Number, optional: true, label: 'vatAmount' },

    // ctax
    hasCtax: { type: Boolean, optional: true, label: 'hasCtax' },
    ctaxRowId: { type: String, optional: true, label: 'ctaxRowId' },
    isHandleCtax: { type: Boolean, optional: true, label: 'isHandleCtax' },
    ctaxAmount: { type: Number, optional: true, label: 'ctaxAmount' },

    extraData: { type: Object, optional: true },

    contentType: { type: String, optional: true, label: 'sync content type' },
    contentId: { type: String, optional: true, label: 'sync content id' },
  })
);

transactionSchema.index({ originId: 1, originType: 1, originSubId: 1 });
transactionSchema.index({ contentType: 1, contentId: 1 });
