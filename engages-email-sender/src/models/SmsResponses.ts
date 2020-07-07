import { Document, Model, model, Schema } from 'mongoose';

export interface ISmsResponse {
  engageMessageId?: string;
  status?: string;
  responseData?: string;
  to?: string;
  messageId?: string;
}

export interface ISmsResponseDocument extends ISmsResponse, Document {}

export interface ISmsResponseModel extends Model<ISmsResponseDocument> {
  createResponse(doc: ISmsResponse): Promise<ISmsResponseDocument>;
}

const schema = new Schema({
  createdAt: { type: Date, default: new Date(), label: 'Created at' },
  engageMessageId: { type: String, label: 'Engage message id' },
  status: { type: String, label: 'Status' },
  responseData: { type: String, label: 'Stringified response JSON' },
  to: { type: String, label: 'Receiver phone number' },
  messageId: { type: String, label: 'Telnyx message record id' },
});

export const loadLogClass = () => {
  class SmsResponse {
    public static async createResponse(doc: ISmsResponse) {
      return SmsResponses.create(doc);
    }
  }

  schema.loadClass(SmsResponse);

  return schema;
};

loadLogClass();

// tslint:disable-next-line
const SmsResponses = model<ISmsResponseDocument, ISmsResponseModel>('engage_sms_responses', schema);

export default SmsResponses;
