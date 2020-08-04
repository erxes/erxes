import { Document, Model, model, Schema } from 'mongoose';

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

export interface ISmsRequestDocument extends ISmsRequest, Document {}

export interface ISmsRequestModel extends Model<ISmsRequestDocument> {
  createRequest(doc: ISmsRequest): Promise<ISmsRequestDocument>;
  updateRequest(_id: string, doc: ISmsRequest): Promise<ISmsRequestDocument>;
}

const statusSchema = new Schema(
  {
    date: { type: Date, label: 'Status update date' },
    status: { type: String, label: 'Sms delivery status' },
  },
  { _id: false },
);

const schema = new Schema({
  createdAt: { type: Date, default: new Date(), label: 'Created at' },
  engageMessageId: { type: String, label: 'Engage message id' },
  to: { type: String, label: 'Receiver phone number' },
  requestData: { type: String, label: 'Stringified request JSON' },
  // telnyx data
  status: { type: String, label: 'Sms delivery status' },
  responseData: { type: String, label: 'Stringified response JSON' },
  telnyxId: { type: String, label: 'Telnyx message record id' },
  statusUpdates: { type: [statusSchema], label: 'Sms status updates' },
  errorMessages: { type: [String], label: 'Error messages' },
});

export const loadLogClass = () => {
  class SmsRequest {
    public static async createRequest(doc: ISmsRequest) {
      const { engageMessageId, to } = doc;

      const exists = await SmsRequests.findOne({ engageMessageId, to });

      if (exists) {
        throw new Error(`Sms request to "${to}" from engage id "${engageMessageId}" already exists.`);
      }

      return SmsRequests.create(doc);
    }

    public static async updateRequest(_id: string, doc: ISmsRequest) {
      await SmsRequests.updateOne({ _id }, { $set: doc });

      return SmsRequests.findOne({ _id });
    }
  }

  schema.loadClass(SmsRequest);

  return schema;
};

loadLogClass();

// tslint:disable-next-line
const SmsRequests = model<ISmsRequestDocument, ISmsRequestModel>('engage_sms_requests', schema);

export default SmsRequests;
