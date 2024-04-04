import { commonSchema, ICommonFields, ICommonDocument } from './common';
import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { schemaHooksWrapper } from './utils';

export interface IDonate extends ICommonFields {
  donateScore: number;
  awardId: string;
  voucherId: string;
}

export interface IDonateDocument extends IDonate, ICommonDocument, Document {
  _id: string;
}

export const donateSchema = schemaHooksWrapper(
  new Schema({
    ...commonSchema,

    donateScore: field({ type: Number }),
    awardId: field({ type: String, label: 'Won Award', optional: true }),
    voucherId: field({ type: String, label: 'Won Voucher', optional: true })
  }),
  'erxes_loyalty_donates'
);
