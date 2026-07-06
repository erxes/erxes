import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export interface IFavorites {
  userId: string;
  path: string;
  breadcrumb?: string[];
}

export interface IFavoritesDocument extends IFavorites, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const favoritesSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    path: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    breadcrumb: {
      type: [String],
      default: undefined,
    },
  },
  { timestamps: true },
);

favoritesSchema.index({ userId: 1, path: 1 }, { unique: true });
