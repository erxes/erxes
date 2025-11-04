import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const cleaningHistorySchema = new Schema({
  _id: mongooseStringRandomId,
  roomId: { type: String, label: 'room id' },
  statusPrev: { type: String, label: 'status previous' },
  status: { type: String, label: 'status' },
  date: { type: Date, label: 'date' },
  who: { type: String, label: 'status' },
});
