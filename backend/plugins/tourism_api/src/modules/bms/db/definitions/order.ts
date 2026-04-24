import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export { IOrder, IOrderDocument } from '@/bms/@types/order';

const paymentTransactionSchema = new Schema(
  {
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'qpay', 'other'],
      required: true,
    },
    note: { type: String },
    paidAt: { type: Date, required: true },
    recordedBy: { type: String },
  },
  { _id: false },
);

const travelerSchema = new Schema(
  {
    customerId: { type: String },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    type: { type: String, enum: ['adult', 'child', 'infant'], required: true },
    passportNumber: { type: String },
    dateOfBirth: { type: Date },
    nationality: { type: String },
  },
  { _id: false },
);

export const orderSchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date },
  modifiedAt: { type: Date },

  // References
  branchId: { type: String, index: true },
  primaryCustomerId: { type: String, index: true },
  tourId: { type: String, index: true },

  // Tour snapshot
  tourName: { type: String },
  tourStartDate: { type: Date },
  tourEndDate: { type: Date },

  // Order lifecycle status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
    index: true,
  },

  // Package snapshot — saved at booking time, never re-fetched
  package: {
    packageId: { type: String },
    title: { type: String },
    minPersons: { type: Number },
    maxPersons: { type: Number },
    accommodationType: { type: String },
  },

  // People breakdown
  people: {
    adults: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
  },

  // Pricing snapshot — computed on backend at booking time
  pricing: {
    adultPrice: { type: Number, default: 0 },
    childPrice: { type: Number, default: 0 },
    infantPrice: { type: Number, default: 0 },
    domesticFlight: { type: Number, default: 0 },
    singleSupplement: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
  },

  // Prepaid snapshot — computed on backend at booking time
  prepaid: {
    enabled: { type: Boolean, default: false },
    percent: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
  },

  // Payment ledger
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    paidAmount: { type: Number, default: 0 },
    method: { type: String },
    transactions: { type: [paymentTransactionSchema], default: [] },
  },

  // Traveler snapshots — historical record of who traveled
  travelers: { type: [travelerSchema], default: [] },

  note: { type: String },
  internalNote: { type: String },
  createdBy: { type: String },

  // Deprecated fields — kept for migration compatibility, do not use in new code
  customerId: { type: String },
  amount: { type: Number },
  numberOfPeople: { type: Number },
  isChild: { type: Boolean },
  parent: { type: String },
  type: { type: String },
  additionalCustomers: { type: [String] },
  invoices: { type: Object },
});
