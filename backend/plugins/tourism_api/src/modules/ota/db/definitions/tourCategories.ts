import { IOTATourCategoryDocument } from '@/ota/@types/tourCategories';
import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const otaTourCategorySchema = new Schema<IOTATourCategoryDocument>({
  _id: mongooseStringRandomId,
  name: { type: String, required: true },
  description: String,
  slug: { type: String, unique: true },
});
