import { Document } from 'mongoose';

export type OrderStatus = 'draft' | 'confirmed' | 'cancelled' | 'completed';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export type TravelerType = 'adult' | 'child' | 'infant';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'qpay' | 'other';

export interface IOrderPeople {
  adults: number;
  children: number;
  infants: number;
}

export interface IOrderPackageSnapshot {
  packageId: string;
  title: string;
  minPersons: number;
  maxPersons?: number;
  accommodationType?: string;
}

export interface IOrderPricingSnapshot {
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  domesticFlight: number;
  singleSupplement: number;
  subtotal: number;
  totalAmount: number;
}

export interface IOrderPrepaid {
  enabled: boolean;
  percent: number;
  amount: number;
  remainingAmount: number;
}

export interface IPaymentTransaction {
  amount: number;
  method: PaymentMethod;
  note?: string;
  paidAt: Date;
  recordedBy?: string;
}

export interface IOrderPayment {
  status: PaymentStatus;
  paidAmount: number;
  method?: PaymentMethod;
  transactions: IPaymentTransaction[];
}

export interface ITravelerSnapshot {
  customerId?: string;
  firstName: string;
  lastName: string;
  type: TravelerType;
  passportNumber?: string;
  dateOfBirth?: Date;
  nationality?: string;
}

export interface IOrder {
  branchId: string;
  primaryCustomerId?: string;
  tourId: string;
  tourName?: string;
  tourStartDate?: Date;
  tourEndDate?: Date;
  package: IOrderPackageSnapshot;
  people: IOrderPeople;
  pricing: IOrderPricingSnapshot;
  prepaid: IOrderPrepaid;
  payment: IOrderPayment;
  travelers: ITravelerSnapshot[];
  status: OrderStatus;
  note?: string;
  internalNote?: string;
  createdBy?: string;

  // Deprecated fields kept on the collection for migration compatibility.
  customerId?: string;
  additionalCustomers?: string[];
}

export interface IOrderDocument extends IOrder, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IOrderCreateInput {
  branchId: string;
  tourId: string;
  packageId: string;
  people: IOrderPeople;
  primaryCustomerId?: string;
  singleSupplement?: boolean;
  includeDomesticFlight?: boolean;
  travelers: ITravelerSnapshot[];
  note?: string;
  internalNote?: string;
}

export interface IRecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  note?: string;
  recordedBy?: string;
}
