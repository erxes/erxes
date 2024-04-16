import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITest {
  name: string;
}

export interface ITestDocument extends ITest, Document {
  _id: string;
  createdAt: Date;
}

export const testSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' })
  }),
  'erxes_test'
);

// for goals query. increases search speed, avoids in-memory sorting
