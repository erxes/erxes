export interface ICheckSyncedDeals {
  _id: string;
  name: string;
  amount: any; // JSON field
  number: string;
  createdAt: string;
  stageChangedDate: string;
  __typename: string;
}

export interface ICheckSyncedDealsSync {
  _id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  number: number;
  modifiedAt: Date;
  modifiedBy: string;
  amount: number;
  sendData: string;
  sendStr: string;
  responseData: string;
  responseStr: string;
  error: string;
  content: string;
}
