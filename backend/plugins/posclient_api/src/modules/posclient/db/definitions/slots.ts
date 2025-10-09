import { Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export const posSlotSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, label: 'Code' }),
    posId: field({ type: String, label: 'Pos' }),
    posToken: field({ type: String, label: 'Pos Token' }),
    option: field({ type: Object, lable: 'Option' }),
  }),
  'erxes_pos_slot',
);
