export interface IQpayInvoice {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  amount: number;
  callback_url: string;
}

export interface ISocialPayInvoice {
  amount: string;
  checksum: string;
  invoice: string;
  terminal: string;
  phone?: string;
}
