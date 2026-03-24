import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const cleaningSchema = new Schema({
  _id: mongooseStringRandomId,
  roomId: { type: String, label: 'room id' },
  status: { type: String, label: 'status' },
});
