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
    messengerId: field({ type: String }),
    messengerBrandCode: field({ type: String }),
    kbTopicId: field({ type: String }),
    leadIds: field({ type: [String] }),
    leadMaps: field({ type: [Object] }),
  }),
);
