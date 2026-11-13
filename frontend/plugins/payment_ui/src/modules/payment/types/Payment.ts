export interface IPayment {
  name: string;
  kind: string;
  status?: 'active' | 'inactive';
  config: any;
  createdAt?: Date;
}

export interface IPaymentDocument extends IPayment {
  _id: string;
}

export interface BankCode {
  value: string;
  label: string;
}

export interface City {
  code: string;
  name: string;
}

export interface MccCode {
  value: string;
  label: string;
}

export interface IInvoice {
  _id: string;
  amount: number;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
  currency: string;
  customer: string;
  customerId: string;
  customerType: string;
  description: string;
  invoiceNumber: string;
  status: string;
  transactions: {
    amount: number;
    createdAt: Date;
    status: string;
    paymentKind: string;
  }[];
}
