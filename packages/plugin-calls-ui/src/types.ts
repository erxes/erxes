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

export interface ICallConversation {
  erxesApiId?: string;
  senderPhoneNumber: string;
  recipientPhoneNumber: string;
  integrationId: string;
  callId: string;
  id: string;
}
