import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export interface IBuildingToContactDocument extends Document {
  buildingId: string;
  contactId: string;
  contactType: string;
}

export const buildingToContactSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    buildingId: field({ type: String, required: true }),
    contactId: field({ type: String, required: true }),
    contactType: field({ type: String, required: true })
  }),
  'mobinet_building_to_contact'
);

buildingToContactSchema.index(
  { buildingId: 1, contactId: 1, contactType: 1 },
  { unique: true }
);
