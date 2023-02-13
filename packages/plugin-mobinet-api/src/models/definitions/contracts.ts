import { Document, Schema } from 'mongoose';
import { field } from '../utils';

export interface IContract {
  createdAt: Date;
  customerId: string;
  buildingId: string;
  buildingAssetId: string;
  documentId: string;
  productIds: string[];
}

export interface IContractDocument extends IContract, Document {
  _id: string;
}

export const contractSchema = new Schema({
  createdAt: field({
    type: Date,
    required: true,
    default: Date.now
  }),
  customerId: field({ type: String }),
  buildingId: field({ type: String }),
  documentId: field({ type: String }),
  buildingAssetId: field({ type: String }),
  productIds: field({ type: [String] })
});
