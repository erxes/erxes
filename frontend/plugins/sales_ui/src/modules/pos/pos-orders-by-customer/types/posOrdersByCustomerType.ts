export interface IOrder {
  _id: string;
  __typename: string;
}

export interface IPosOrdersByCustomer {
  _id: string;
  customerDetail: string;
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
