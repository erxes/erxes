import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const settingsSchema = new Schema({
  _id: mongooseStringRandomId,
  erxesApiUrl: { type: String, default: 'http://localhost:4000' },
  erxesApiToken: { type: String },
  defaultAgentId: { type: String },
  memoryDbPath: { type: String, default: 'file:./mastra-memory.db' },
});
