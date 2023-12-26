import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IDestination {
  name: string;
  code: string;
}

export interface IDestinationDocument extends IDestination, Document {
  _id: string;
}

export const destinationSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ required: true, type: String }),
  code: field({ required: true, unique: true, type: String })
});
