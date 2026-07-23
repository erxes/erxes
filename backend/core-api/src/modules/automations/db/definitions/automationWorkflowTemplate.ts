import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const automationWorkflowTemplateSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Template name', required: true },
    description: { type: String, label: 'Template description' },
    entryActionId: { type: String, label: 'Entry action ID' },
    actions: { type: [Object], label: 'Member actions snapshot' },
    inputs: { type: Object, label: 'Input default bindings' },
    createdBy: { type: String, label: 'Created by user ID' },
    createdAt: { type: Date, label: 'Created at', default: new Date() },
    updatedAt: { type: Date, label: 'Updated at', default: new Date() },
  }),
);
