import { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';


export interface IPage {
  clientPortalId: string;
  name: string;
  slug: string;
  layout: string;
  pageItems: any[];
  createdUserId: string;
}

export interface IPageDocument extends IPage, Document {
  _id: string;
}

export const pageSchema = new Schema<IPageDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    layout: { type: String, required: false },
    createdUserId: { type: String, ref: 'User' },
    pageItems: [
      {
        type: { type: String, required: true },
        content: { type: Schema.Types.Mixed },
        order: { type: Number, required: true },
        contentType: { type: String },
        contentTypeId: { type: String },
        config: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);



pageSchema.index({ slug: 1, clientPortalId: 1 }, { sparse: true });
