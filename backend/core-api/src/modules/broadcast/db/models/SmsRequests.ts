import { HydratedDocument, Model } from 'mongoose';

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

export interface ISmsRequestModel extends Model<ISmsRequest> {
  createRequest(doc: ISmsRequest): Promise<ISmsRequestDocument>;
  updateRequest(_id: string, doc: ISmsRequest): Promise<ISmsRequestDocument>;
}
