import { Document, Schema, model } from 'mongoose';

export interface IItem {
  _id?: string;
  id?: string;
  name: string;
  barCode?: string;
  barCodeType?: string;
  classificationCode?: string;
  taxProductCode?: string;
  measureUnit?: string;
  qty: number;
  unitPrice: number;
  totalBonus?: number;
  totalVAT?: number;
  totalCityTax?: number;
  totalAmount: number;
  recId: string;
  data?: any;
}

export interface IReceipt {
  _id?: string;
  id?: string;
  totalAmount: number;
  totalVAT?: number;
  totalCityTax?: number;
  taxType: string;
  merchantTin: string;
  bankAccountNo?: string;
  data?: any;
  items: IItem[];
}

export interface IPayment {
  _id?: string;
  code: string;
  exchangeCode?: string;
  status: string;
  paidAmount: number;
  data?: any;
}

export interface IEbarimt {
  _id?: string;
  number: string;
  contentType: string;
  contentId: string;
  userId?: string;
  posToken?: string;

  totalAmount?: number;
  totalVAT?: number;
  totalCityTax?: number;
  districtCode?: string;
  branchNo?: string;
  merchantTin?: string;
  posNo?: string;
  customerTin?: string;
  customerName?: string;
  consumerNo?: string;
  type?: 'B2C_RECEIPT' | 'B2B_RECEIPT';

  data?: any;
  receipts?: IReceipt[];
  payments?: IPayment[];

  status?: string;
  message?: string;
  date?: string;
  registerNo?: string;
  qrData?: string;
  lottery?: string;
  state?: string;
  inactiveId?: string;
  sendInfo?: any;
  modifiedAt?: Date;
  createdAt?: Date;
  reportMonth?: string;
}

export interface IEbarimtFull {
  _id: string;
  id?: string;
  number: string;
  contentType: string;
  contentId: string;
  userId?: string;
  posId?: number;
  posToken?: string;

  totalAmount?: number;
  totalVAT?: number;
  totalCityTax?: number;
  districtCode?: string;
  branchNo?: string;
  merchantTin?: string;
  posNo?: string;
  customerTin?: string;
  customerName?: string;
  consumerNo?: string;
  type?: 'B2C_RECEIPT' | 'B2B_RECEIPT';

  data?: any;
  receipts?: IReceipt[];
  payments?: IPayment[];

  status?: string;
  message?: string;
  date?: string;
  registerNo?: string;
  qrData?: string;
  lottery?: string;
  state?: string;
  inactiveId?: string;
  sendInfo?: any;
  modifiedAt?: Date;
  createdAt: Date;
  reportMonth?: string;
}

export interface IEbarimtDocument extends IEbarimt, Document {
  _id: string;
}


const ItemSchema = new Schema({
  name: String,
  barCode: String,
  barCodeType: String,
  classificationCode: String,
  taxProductCode: String,
  measureUnit: String,
  qty: Number,
  unitPrice: Number,
  totalBonus: Number,
  totalVAT: Number,
  totalCityTax: Number,
  totalAmount: Number,
  recId: String,
  data: Schema.Types.Mixed,
  // From Schema 2
  registerNo: String,
  // From Schema 1
  productId: String,
});

const ReceiptSchema = new Schema({
  totalAmount: Number,
  totalVAT: Number,
  totalCityTax: Number,
  taxType: String,
  merchantTin: String,
  bankAccountNo: String,
  data: Schema.Types.Mixed,
  items: [ItemSchema],
});

const PaymentSchema = new Schema({
  code: String,
  exchangeCode: String,
  status: String,
  paidAmount: Number,
  data: Schema.Types.Mixed,
});

const EbarimtSchema = new Schema(
  {
    userId: String,
    number: String,
    contentType: { type: String, required: true },
    contentId: { type: String, required: true, index: true },
    posToken: String,

    totalAmount: Number,
    totalVAT: Number,
    totalCityTax: Number,
    districtCode: String,
    branchNo: String,
    merchantTin: String,
    posNo: String,
    customerTin: String,
    customerName: String,
    consumerNo: String,
    type: String,

    // Newly added fields
    inactiveId: String,
    invoiceId: String,
    easy: Boolean,
    oldTaxType: String,
    getInformation: String,

    data: Schema.Types.Mixed,
    receipts: [ReceiptSchema],
    payments: [PaymentSchema],

    status: String,
    message: String,
    date: String,
    registerNo: String,
    qrData: String,
    lottery: String,
    state: String,
    sendInfo: Schema.Types.Mixed,
    reportMonth: String,
  },
  { timestamps: true }
);

EbarimtSchema.index({ contentType: 1, contentId: 1, state: 1, type: 1 });

export const EbarimtModel = model<IEbarimt & Document>(
  'Ebarimt',
  EbarimtSchema,
  'erxes_ebarimt'
);

export const ebarimtSchema = EbarimtSchema;
