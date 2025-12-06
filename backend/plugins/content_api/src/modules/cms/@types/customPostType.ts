import { Document } from 'mongoose';

export interface ICustomPostType {
  _id: string;
  clientPortalId: string;

  label: string;
  name?: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface ICustomPostTypeDocument extends ICustomPostType, Document {
  _id: string;
}
