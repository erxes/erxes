import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IScript {
  name: string;
  messengerId?: string;
  messengerBrandCode?: string;
  leadIds?: string[];
  leadMaps?: Array<{ formCode: string; brandCode: string }>;
  kbTopicId?: string;
}

export interface IScriptDocument extends IScript, Document {
  _id: string;
  scopeBrandIds?: string[];
}

export const scriptSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    messengerId: field({ type: String, optional: true, label: 'Messenger integration' }),
    messengerBrandCode: field({ type: String, optional: true, label: 'Messenger brand code' }),
    kbTopicId: field({ type: String, optional: true, label: 'Knowledgebase topic' }),
    leadIds: field({ type: [String], optional: true, label: 'Leads' }),
    leadMaps: field({ type: [Object], optional: true }),
  }),
);
