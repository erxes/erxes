import { Document, Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const FILE_PIN_ITEM_TYPES = ['file', 'folder'] as const;
export type TFilePinItemType = (typeof FILE_PIN_ITEM_TYPES)[number];

export interface IFilePin {
  userId: string;
  itemType: TFilePinItemType;
  itemId: string;
}

export interface IFilePinDocument extends IFilePin, Document {
  _id: string;
  createdAt: Date;
}

export const filePinSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    userId: { type: String, required: true },
    itemType: { type: String, enum: FILE_PIN_ITEM_TYPES, required: true },
    itemId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

filePinSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });
filePinSchema.index({ itemId: 1 });
