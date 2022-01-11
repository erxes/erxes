import { Document } from 'mongoose';

import { IItemCommonFields } from './boards';

export interface ITaskDocument extends IItemCommonFields, Document {
  _id: string;
}
