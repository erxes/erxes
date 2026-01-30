export interface ICoupon {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  amount: number;
  createdBy: {
    email: string;
    details: {
      firstName?: string;
      fullName?: string;
      lastName?: string;
      avatar?: string;
      middleName?: string;
      shortName?: string;
    };
  };
  updatedBy: {
    email: string;
    details: {
      avatar?: string;
      firstName?: string;
      fullName?: string;
      lastName?: string;
      shortName?: string;
      middleName?: string;
    };
  };
  conditions: any;
  kind: string;
}
