import { QueryResponse } from 'modules/common/types';

type SmsStatus = {
  status: string;
  date: Date;
};

export interface ISmsDelivery {
  _id: string;
  createdAt: Date;
  to: string;

  // telnyx data
  direction: string;
  status: string;
  responseData?: string;
  telnyxId?: string;
  statusUpdates: [SmsStatus];
  errorMessages: [string];

  // engage only
  engageMessageId?: string;

  // integrations only
  from?: string;
  content?: string;
  requestData?: string;
  erxesApiId?: string;
}

interface ISmsDeliveries {
  totalCount: number;
  list: ISmsDelivery[];
}

export type SmsDeliveriesQueryResponse = {
  smsDeliveries: ISmsDeliveries;
} & QueryResponse;
