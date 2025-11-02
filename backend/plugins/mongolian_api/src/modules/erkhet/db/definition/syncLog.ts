import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const syncLogSchema = new Schema(
  {
    _id: mongooseStringRandomId,

    contentType: { type: String, label: 'type', index: true },
    contentId: { type: String, label: 'content', index: true },

    createdBy: { type: String, label: 'Created by', optional: true },

    consumeData: { type: Object, label: 'consumeData' },
    consumeStr: { type: String, label: 'consumeStr' },

    sendData: { type: Object, label: 'sendData', optional: true },
    sendStr: { type: String, label: 'sendStr', optional: true },

    responseData: { type: Object, label: 'responseData', optional: true },
    responseStr: { type: String, label: 'responseStr', optional: true },

    error: { type: String, label: 'error', optional: true },
  },
  {
    timestamps: true,
  },
);
