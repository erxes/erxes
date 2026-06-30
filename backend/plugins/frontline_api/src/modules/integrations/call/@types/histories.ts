export interface ICallHistory {
  operatorPhone: string;
  customerPhone: string;
  callDuration: number;
  callStartTime: Date;
  callEndTime: Date;
  callType: string;
  callStatus: string;
  timeStamp: number | string;
  modifiedAt: Date;
  createdAt: Date;
  createdBy: string;
  modifiedBy: string;
  conversationId: string;
  acceptedUserId: string;
  recordUrl: string;
  endedBy: string;
  queueName: string;
  inboxIntegrationId: string;
  extensionNumber: string;
  uniqueid?: string;
}

export interface ICallHistoryArgs {
  limit?: number;
  callStatus?: string;
  callType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
  searchValue?: string;
  skip?: number;
  integrationId: string;
}

export interface ICallHistoryDocument extends ICallHistory, Document {
  _id: string;
}

export interface ICallHistoryFilterOptions {
  integrationId: string;
  callStatus?: 'cancelled' | 'missed' | 'connected';
  searchValue?: string;
  skip?: number;
  limit?: number;
  createdAt?: Date;
  updateAt?: Date;
  callType?: 'incoming' | 'outgoing';
  duration?: number;
}
