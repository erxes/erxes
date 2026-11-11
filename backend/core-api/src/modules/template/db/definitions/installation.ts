import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

// What one install of a template created; the copies live on their own
export const templateInstallationSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    templateId: {
      type: String,
      required: true,
      index: true,
      label: 'Template',
    },
    pluginName: { type: String, required: true, label: 'Declared by' },
    version: { type: Number, required: true, label: 'Template version' },
    name: { type: String, required: true, label: 'Template name' },
    answers: { type: Object, label: 'Answers, without secrets' },
    partIds: { type: Object, label: 'Created records by part key' },
    automationIds: {
      type: Object,
      label: 'Created automations by journey key',
    },
    createdBy: { type: String, label: 'Installed by' },
    createdAt: { type: Date, default: Date.now, label: 'Installed at' },
  }),
);
