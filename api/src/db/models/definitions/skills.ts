import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ISkillType {
  name: string;
}

export interface ISkillTypeDocument extends ISkillType, Document {
  _id: string;
}

export const skillTypeSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' })
  })
);

export interface ISkill {
  name: string;
  memberIds: string[];
}

export interface ISkillDocument extends ISkill, Document {
  _id: string;
}

export const skillSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    memberIds: field({ type: [String] })
  })
);
