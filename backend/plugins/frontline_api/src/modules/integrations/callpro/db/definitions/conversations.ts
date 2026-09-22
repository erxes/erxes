import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const callProConversationSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiId: { type: String, label: 'Conversation id at inbox' },
  state: { type: String, label: 'Call disposition' },
  integrationId: { type: String, label: 'Call Pro integration id' },
  senderPhoneNumber: { type: String, index: true, label: 'Dialled number' },
  recipientPhoneNumber: { type: String, index: true, label: 'Caller number' },
  callId: { type: String, unique: true, label: 'Call Pro call id' },
});
