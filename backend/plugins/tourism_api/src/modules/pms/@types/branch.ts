import { Document } from 'mongoose';

export interface IPmsBranch {
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  user1Ids?: string[];
  user2Ids?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken: string;
  token: string;
  uiOptions?: any;
  permissionConfig?: any;
  status: string;
  pipelineConfig: any;
  extraProductCategories?: string[];
  roomCategories?: string[];
  websiteReservationLock?: boolean;
  time?: string;
  discount?: any;

  checkintime?: string;
  checkouttime?: string;
  checkinamount?: number;
  checkoutamount?: number;
}
export interface IPmsBranchDocument extends IPmsBranch, Document {
  _id: string;
}
export interface IPmsBranchEdit extends IPmsBranch {
  _id: string;
}
