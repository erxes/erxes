import { IUser } from '@erxes/ui/src/auth/types';

export type IUserCall = IUser & {
  time: string;
  isMissedCall: boolean;
};

export type Operator = {
  userId: string;
  gsUsername: string;
  gsPassword: string;
};

export interface ICustomerDoc {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phones?: string[];
  primaryPhone?: string;
}

export interface ICustomer extends ICustomerDoc {
  _id: string;
  getTags?: ITag[];
}

export interface ITag {
  _id: string;
  type: string;
  name: string;
  colorCode: string;
  objectCount?: number;
  parentId?: string;
  order?: string;
  totalObjectCount?: number;
}

export interface IHistoryDoc {
  operatorPhone: string;
  customerPhone: string;
  callDuration: number;
  callStartTime: Date;
  callEndTime: Date;
  callType: string;
  callStatus: string;
  sessionId: string;
  updatedAt: Date;
  createdAt: Date;
  createdBy: string;
  updatedBy: string;
}
export interface IHistory extends IHistoryDoc {
  _id: string;
  customer: ICustomer;
}

export interface ICallConfig {
  _id: string;
  inboxId: string;
  phone: string;
  wsServer: string;
  operators: JSON;
  token: string;
}
export interface ICallConfigDoc extends ICallConfig {
  isAvailable: boolean;
}
