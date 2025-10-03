import { Document } from 'mongoose';
import { IPipeline } from './pipeline';

export interface IBoard {
  name?: string;
  userId?: string;
  order?: number;
}

export interface IBoardDocument extends IBoard, Document {
  _id: string;
  createdAt?: Date;
  pipelines?: IPipeline[];
}
