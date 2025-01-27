import { stringRandomId } from '@erxes/api-utils/src/mongoose-types';
import { Schema } from 'mongoose';

export interface IView {
  name: string;

  createdAt: Date;
  createdBy: string;

  updatedAt: Date;
  updatedBy: string;

  serviceName: string;
  contentType: string;
  viewType: string;
  viewConfig: any;
}

export interface IViewDocument extends IView, Document {
  _id: string;
}

export const viewSchema = new Schema<IViewDocument>(
  {
    _id: stringRandomId,
    name: { type: String },

    createdAt: { type: Date, default: new Date(), index: 1 },
    createdBy: { type: String },

    updatedAt: { type: Date, default: new Date(), index: 1 },
    updatedBy: { type: String },

    serviceName: { type: String, required: true },
    contentType: { type: String, required: true, index: 1 },

    viewType: { type: String, required: true, index: 1 },
    viewConfig: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);
