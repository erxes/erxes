import { Schema } from 'mongoose';
import { field } from '../utils';

export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  inboxId: field({ type: String, label: 'inbox id' }),
  wsServer: field({ type: String, label: 'web socket server' }),
  phone: field({ type: String, label: 'phone number' }),
  operators: field({ type: Object, label: 'Operator maps' }),
  token: field({ type: String, label: 'token' }),
  queues: field({ type: [String], label: 'queues' }),
  queueNames: field({ type: [String], label: 'queue names' }),
  srcTrunk: field({ type: String, label: 'inbound trunk name' }),
  dstTrunk: field({ type: String, label: 'outbound trunk name' }),
});

integrationSchema.index({ wsServer: 1, queues: 1 }, { unique: true });
integrationSchema.index({ srcTrunk: 1 }, { unique: true });
integrationSchema.index({ dstTrunk: 1 }, { unique: true });
