import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const automationVersionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    automationId: { type: String, label: 'Automation ID', required: true },
    version: { type: Number, label: 'Version number', required: true },
    triggers: { type: [Object], label: 'Triggers at this version' },
    actions: { type: [Object], label: 'Actions at this version' },
    workflows: { type: [Object], label: 'Workflows at this version' },
    // Flow content only; moving a node on the canvas is not a new version
    contentHash: { type: String, label: 'Content hash', required: true },
    // Triggers, actions and workflows added, changed or removed since the
    // version before; a node's own history is the versions listing it
    changedNodeIds: { type: [String], label: 'Changed node IDs', default: [] },
    note: { type: String, label: 'What made this version' },
    createdBy: { type: String, label: 'Saved by user ID' },
    createdAt: { type: Date, label: 'Saved at', default: Date.now },
  }),
);

automationVersionSchema.index(
  { automationId: 1, version: -1 },
  { unique: true },
);
automationVersionSchema.index({ automationId: 1, changedNodeIds: 1 });
