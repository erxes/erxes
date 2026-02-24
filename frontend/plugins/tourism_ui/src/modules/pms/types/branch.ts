export interface IPmsPaymentType {
  _id: string;
  type: string;
  title: string;
  icon?: string;
  config?: string;
}

export interface IPmsDiscount extends IPmsPaymentType {}

export interface IPmsUser {
  _id: string;
  details: { avatar: string; fullName: string };
}
export interface IPmsUiOptions {
  logo?: string;
  texts?: string;
  colors?: { primary?: string; secondary?: string; third?: string };
}
export interface IPmsPipelineConfig {
  boardId: string;
  pipelineId: string;
}

export interface IPmsBranch {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  token: string;
  erxesAppToken?: string;
  userId: string;
  user1Ids?: string[];
  user2Ids?: string[];
  user3Ids?: string[];
  user4Ids?: string[];
  user5Ids?: string[];
  paymentIds?: string[];
  paymentTypes?: IPmsPaymentType[];
  user?: IPmsUser;
  uiOptions?: IPmsUiOptions;
  permissionConfig?: any;
  pipelineConfig?: IPmsPipelineConfig;
  extraProductCategories?: string[];
  roomCategories?: string[];
  discount?: IPmsDiscount[];
  time?: string;
  checkintime: string;
  checkouttime: string;
  checkinamount?: number;
  checkoutamount?: number;
}
