export interface IRouterProps {
  history: any;
  location: any;
  match: any;
}

export interface IPaymentParams {
  contentType: string;
  contentTypeId: string;
  amount: number;
  companyId?: string;
  customerId?: string;
  description: string;
  paymentConfigIds?: string[];
  redirectUri?: string;
  phone?: string;
}

export type QueryResponse = {
  loading: boolean;
  refetch: () => Promise<any>;
  error?: string;
};

export interface IQpayUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}
export interface IQpayResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  qPay_shortUrl: string;
  urls: IQpayUrl[];
}

export interface ISocialPayResponse {
  text: string;
}

export interface IInvoice {
  _id: string;
  amount: number;
  apiResponse: IQpayResponse | ISocialPayResponse;
  companyId: string;
  contentType: string;
  contentTypeId: string;
  customerId: string;
  description: string;
  email: string;
  paymentConfigId: string;
  phone: string;
  status: string;
}
