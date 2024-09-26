import { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import { componentSchema } from './components';
import {nanoid} from 'nanoid';

export interface IPage {
  name: string;
  slug: string;
  layout: string;
  components: any[];
  createdAt: Date;
  updatedAt: Date;
  contentType: string;
  contentTypeId: string;
}

export interface IPageDocument extends IPage, Document {
  _id: string;
}

export const pageSchema = new Schema<IPageDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    layout: { type: String, required: true },
    components: [
      {
        type: { type: String, required: true },
        content: { type: Schema.Types.Mixed, required: true },
        tailwindClasses: { type: String, required: true },
        order: { type: Number, required: true },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    contentType: { type: String, required: true },
    contentTypeId: { type: String, required: true },
  },
  { timestamps: true }
);

pageSchema.pre<IPageDocument>('save', async function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});
