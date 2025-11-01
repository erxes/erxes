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
}