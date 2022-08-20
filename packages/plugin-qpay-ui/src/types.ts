export interface IQpayInvoice {
  _id?: string;
  senderInvoiceNo: string;
  amount: string;
  qpayInvoiceId: string;
  qrText: string;
  qpayPaymentId: string;
  status: string;
  createdAt: Date;
  paymentDate: Date;
}

export type QpayInvoiceQueryResponse = {
  qpayInvoices: IQpayInvoice[];
  loading: boolean;
  refetch: () => void;
};

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  searchValue?: string;
};

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IConfig = {
  _id: string;
  code: string;
  value: any;
};

export type ConfigsQueryResponse = {
  configs: IConfig[];
  loading: boolean;
  refetch: () => void;
};
