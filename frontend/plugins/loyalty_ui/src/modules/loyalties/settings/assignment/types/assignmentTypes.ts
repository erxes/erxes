export interface IAssignment {
  _id: string;
  title: string;
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
  voucherCampaignId?: string;
  segmentIds?: string[];
}
