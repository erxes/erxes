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
}

export const scriptSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    messengerId: field({ type: String, optional: true }),
    messengerBrandCode: field({ type: String, optional: true }),
    kbTopicId: field({ type: String, optional: true }),
    leadIds: field({ type: [String], optional: true }),
    leadMaps: field({ type: [Object], optional: true }),
  }),
);
