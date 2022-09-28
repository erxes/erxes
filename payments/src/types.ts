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
  paymentIds?: string[];
  redirectUri?: string;
  phone?: string;
}

export type QueryResponse = {
  loading: boolean;
  refetch: () => Promise<any>;
  error?: string;
};
