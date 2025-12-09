export interface ICheckPosOrders {
  _id: string;
  number: string;
  totalAmount: string;
  createdAt: string;
  paidDate: string;
  __typename: string;
}

export interface ICheckPosOrdersSync {
  _id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  orderNumber: number;
  modifiedAt: Date;
  modifiedBy: string;
}
