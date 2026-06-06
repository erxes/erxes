export interface ICovers {
  _id: string;
  posToken: string;
  status: string;
  beginDate: string;
  endDate: string;
  description: string;
  userId: string;
  note: string;
  posName: string;
  createdAt: string;
  createdUser?: {
    email: string;
  };
  user?: {
    _id: string;
    email: string;
  };
  totalAmount?: number;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: Array<{
    type: string;
    amount: number;
  }>;
  details?: Array<{
    _id: string;
    paidType: string;
    paidSummary: Array<{
      _id: string;
      kind: string;
      kindOfVal: string;
      value: string;
      amount: number;
    }>;
    paidDetail: string;
  }>;
}
