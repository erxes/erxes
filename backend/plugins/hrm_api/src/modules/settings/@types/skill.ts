import { Document } from 'mongoose';

export interface ISkill {
  code: string;
  name: string;
  description?: string;
  category?: string;
  score?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISkillDocument extends ISkill, Document {
  _id: string;
}
