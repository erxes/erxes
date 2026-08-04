import { IOrder } from '@/pos/types/order';

export interface IPosOrdersByCustomer {
  _id: string;
  customerDetail?: {
    _id?: string;
    state?: string;
    primaryName?: string;
    firstName?: string;
    lastName?: string;
    primaryEmail?: string;
    primaryPhone?: string;
    code?: string;
    emails?: { email?: string };
  } | null;
  customerType: string;
  orders: IOrder[];
  totalOrders: number;
  totalAmount: number;
  __typename: string;
}

export interface IPosOrdersByCustomerResponse {
  posOrderCustomers: IPosOrdersByCustomer[];
  posOrderCustomersTotalCount: number;
}
