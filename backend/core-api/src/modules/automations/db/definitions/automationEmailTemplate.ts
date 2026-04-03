import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const automationEmailTemplateSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Template name', required: true },
    description: { type: String, label: 'Template description' },
    content: { type: String, label: 'Template content', required: true },
    createdBy: { type: String, label: 'Created by user ID', required: true },
    createdAt: { type: Date, label: 'Created at', default: new Date() },
    updatedAt: { type: Date, label: 'Updated at', default: new Date() },
  }),
);
