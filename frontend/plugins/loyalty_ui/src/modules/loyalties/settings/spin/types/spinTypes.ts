export interface ISpin {
  _id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  type: string;
  amount?: number;
  createdBy?: {
    email: string;
    details?: {
      avatar?: string;
      firstName?: string;
      fullName?: string;
      lastName?: string;
      middleName?: string;
      position?: string;
    };
  };
  updatedBy?: {
    email: string;
    details?: {
      avatar?: string;
      firstName?: string;
      fullName?: string;
      lastName?: string;
      middleName?: string;
      position?: string;
    };
  };
  conditions?: any;
  kind?: string;
  maxScore?: number;
  buyScore?: number;
}
