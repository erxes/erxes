import { Schema } from 'mongoose';

const statusSchema = new Schema(
  {
    date: { type: Date, label: 'Status update date' },
    status: { type: String, label: 'Sms delivery status' },
  },
  { _id: false },
);

export const smsRequestSchema = new Schema({
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
