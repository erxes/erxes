interface IQPayUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface IQPayInvoice {
  _id: string;
  senderInvoiceNo?: string;
  amount: string;
  qpayInvoiceId?: string;
  qrText?: string;
  qpayPaymentId?: string;
  paymentDate?: Date;
  createdAt?: Date;
  status?: string;
  urls?: IQPayUrl[];
}
