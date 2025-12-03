import { Schema } from 'mongoose';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const responseTemplateSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    createdBy: { type: String, label: 'Created by' },
    name: { type: String, label: 'Name' },
    content: { type: String, label: 'Content' },
    channelId: { type: String, label: 'Channel ID' },
    files: { type: Array, label: 'Files' },
    updatedAt: { type: Date, default: new Date(), label: 'Updated at' },
  }),
);
