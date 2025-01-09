export interface IQpayInvoice {
  invoice_code: string;
  sender_terminal_code?: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  sender_branch_code?: string;
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

export interface IGolomtInvoice {
  amount: string;
  callback: string;
  checksum: string;
  genToken: 'Y' | 'N';
  returnType: 'POST' | 'GET' | 'MOBILE';
  transactionId: string;
  socialDeeplink: 'Y' | 'N';
}

export interface IMonpayInvoice {
  amount: number;
  generateUuid: boolean;
  displayName: string;
  callbackUrl: string;
}

export interface IPocketInvoice {
  amount: number;
  info: string;
}

export interface IMonpayConfig {
  username: string;
  accountId: string;
}
