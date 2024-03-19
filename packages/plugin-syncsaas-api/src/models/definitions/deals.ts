import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface SyncedDeal {
  dealId: string;
  syncId: string;
  syncedContactType: string;
  syncedContactTypeId: string;
}

export interface SyncedDealDocuments extends SyncedDeal, Document {
  _id: string;
}

export const syncedDealSchema = new Schema({
  _id: field({ pkey: true }),
  dealId: field({ type: String, label: 'Deal Id' }),
  syncId: field({ type: String, label: 'Sync Id' }),
  syncedContactTypeId: field({ type: String, label: 'Customer Id' }),
  syncedContactType: field({ type: String, label: 'Contact Type' }),
});
