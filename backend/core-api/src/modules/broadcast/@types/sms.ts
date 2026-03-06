import { HydratedDocument } from 'mongoose';

interface ISmsStatus {
  date: Date;
  status: string;
}

export interface ISmsRequest {
  engageMessageId?: string;
  to?: string;
  status?: string;
  requestData?: string;
  responseData?: string;
  telnyxId?: string;
  statusUpdates?: ISmsStatus[];
  errorMessages?: string[];
}

export type ISmsRequestDocument = HydratedDocument<ISmsRequest>;

export interface ISmsDeliveryQueryParams {
  type: string;
  to?: string;
}
