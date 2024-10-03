import { IUser } from '@erxes/ui/src/auth/types';

export type IUserCall = IUser & {
  time: string;
  isMissedCall: boolean;
};

export type Operator = {
  userId: string;
  gsUsername: string;
  gsPassword: string;
  gsForwardAgent: boolean;
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
  conversationId: string;
  callDuration: number;
  callStartTime: Date;
  callEndTime: Date;
  callType: string;
  callStatus: string;
  timeStamp: number;
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
  queues: [string];
}
export interface ICallConfigDoc extends ICallConfig {
  isAvailable: boolean;
}

export interface IQueue {
  queuechairman: string;
  queue: string;
  total_calls: string;
  answered_calls: string;
  answered_rate: string;
  abandoned_calls: string;
  avg_wait: string;
  avg_talk: string;
  vq_total_calls: string;
  sla_rate: string;
  vq_sla_rate: string;
}

interface CallMember {
  callerchannel: string;
  callerid: string;
  calleechannel: string;
  calleeid: string;
  bridge_time: string;
}

export interface IWaitingCall {
  extension: string;
  member: CallMember[];
}

interface QueueMember {
  member_extension: string;
  status: string;
  membership: string;
  answer: number;
  abandon: number;
  logintime: string;
  talktime: number;
  pausetime: string;
  first_name: string;
  last_name: string;
  pause_reason: string;
}

export interface IQueueDoc {
  extension: string;
  member: QueueMember[];
}
