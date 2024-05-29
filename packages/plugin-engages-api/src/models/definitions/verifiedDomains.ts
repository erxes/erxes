import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IVerifiedDomain {
  domain: string;
}

export interface IVerifiedDomainDocument extends IVerifiedDomain, Document {
  _id: string;
}

// Mongoose schemas ===========
export const domainSchema = new Schema({
   _id: { type: String, default: () => nanoid() },
  brandId: { type: String, required: true },
  domain: {
    type: String,
    unique: true,
    label: 'Domain',
  },
});
