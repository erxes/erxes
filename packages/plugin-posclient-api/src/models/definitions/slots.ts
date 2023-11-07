import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IPosSlot {
  _id?: string;
  posId: string;
  name: string;
  code: string;
  option: object;
}

export interface IPosSlotDocument extends IPosSlot, Document {
  _id: string;
}

export const posSlotSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, label: 'Code' }),
    posId: field({ type: String, label: 'Pos' }),
    option: field({ type: Object, lable: 'Option' })
  }),
  'erxes_pos_slot'
);
