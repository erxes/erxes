import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IRisk {
  name: string;
  code: string;
  description?: string;
}

export interface IRiskDocument extends IRisk, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export const riskSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ required: true, type: String }),
  code: field({ required: true, unique: true, type: String }),
  description: field({ optional: true, type: String }),
  createdAt: field({ type: Date, default: Date.now }),
  updatedAt: field({ type: Date, default: Date.now }),
  lastModifiedBy: field({ type: String, optional: true }),
  searchText: field({ type: String, optional: true })
});
