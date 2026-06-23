import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const settingsSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiUrl: { type: String, default: 'http://localhost:4000' },
  erxesApiToken: { type: String },
  defaultAgentId: { type: String },
  // Chat attachments toggle — effective only when core upload storage exists.
  attachmentsEnabled: { type: Boolean, default: true },
  // Written by the company-knowledge reconciliation sweep; read-only in the UI.
  knowledgeSyncStatus: { type: Schema.Types.Mixed },
});
