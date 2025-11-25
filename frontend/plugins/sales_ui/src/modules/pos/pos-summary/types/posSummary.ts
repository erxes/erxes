export interface IPosSummary {
  _id: string;
  paidDate: string;
  paidEndDate?: string;
  createdAt?: string;
  billId?: string;
  number?: string;
  cashAmount?: number;
  mobileAmount?: number;
  totalAmount?: number;
  finalAmount?: number;
  customerId?: string;
  posName?: string;
  type?: string;
  user?: {
    email?: string;
    details?: {
      fullName?: string;
    };
  };
  amounts: {
    count: number;
    cashAmount: number;
    mobileAmount: number;
    invoice: number;
  };
}

export interface IPosOrdersGroupSummary {
  list: IPosSummary[];
  totalCount: number;
}
