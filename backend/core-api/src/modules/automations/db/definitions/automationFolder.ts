import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const automationFolderSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Folder name', required: true },
    icon: { type: String, label: 'Tabler icon name' },
    // Set when a template install made it; that installation's automations
    installationId: { type: String, label: 'Template installation ID' },
    createdBy: { type: String, label: 'Created by user ID' },
    createdAt: { type: Date, label: 'Created at', default: Date.now },
    updatedAt: { type: Date, label: 'Updated at', default: Date.now },
  }),
);

automationFolderSchema.index({ installationId: 1 });
