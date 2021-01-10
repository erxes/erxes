import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ISkillType {
  name: string;
}

export interface ISkillTypeDocument extends ISkillType, Document {
  _id: string;
  createdAt: Date;
}

export const skillTypeSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    createdAt: field({ type: Date })
  })
);

export interface ISkill {
  name: string;
  typeId: string;
  memberIds: string[];
}

export interface ISkillDocument extends ISkill, Document {
  _id: string;
  createdAt: Date;
}

export const skillSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    typeId: field({ type: String }),
    memberIds: field({ type: [String] }),
    createdAt: field({ type: Date })
  })
);
