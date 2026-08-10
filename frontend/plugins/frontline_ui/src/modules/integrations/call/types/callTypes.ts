import { IAttachment } from 'erxes-ui';

export interface ICallConfig {
  _id: string;
  inboxId: string;
  phone: string;
  wsServer: string;
  operators: { userId: string; gsUsername: string; gsPassword: string }[];
  queues: string[];
  srcTrunk: string;
  dstTrunk: string;
}
export interface ICallConfigDoc extends ICallConfig {
  isAvailable: boolean;
}

export interface ICallQueueAgent {
  member_extension: string;
  status?: string;
  first_name?: string;
  last_name?: string;
  membership?: string;
  answer?: number;
  abandon?: number;
  logintime?: string;
  talktime?: number;
  pausetime?: string;
  pause_reason?: string;
  queue_action?: string;
}

export interface ICallQueueRealtimeSnapshot {
  extension: string;
  waiting: { callerid: string; callerchannel?: string; state?: string }[];
  talking: {
    callerid: string;
    calleeid?: string;
    bridged?: boolean;
    bridge_time?: string;
  }[];
  agents: ICallQueueAgent[];
  stats: Record<string, unknown>;
}

export interface ICallConversationNote {
  _id: string;
  content: string;
  createdAt: string;
  attachments: IAttachment[];
  customerId?: string;
  userId?: string;
  internal?: boolean;
}

export interface ICustomerDoc {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phones?: any[];
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
