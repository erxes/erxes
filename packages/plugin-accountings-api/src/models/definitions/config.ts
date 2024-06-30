import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IAccountingConfig {
  code: string;
  value: any;
}

export interface IAccountingConfigDocument
  extends IAccountingConfig,
    Document {
  _id: string;
}

// Mongoose schemas ===========

export const accountingConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object }),
});

// VAT_RULE: string; '' = bagtsan, 'add' = undsen unedeer nemj tootsoh,
// MainCurrency: string; main currency in country
// 
