import { ICommonFields, ICommonDocument } from './common';
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
