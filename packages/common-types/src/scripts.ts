import { Document } from 'mongoose';

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
