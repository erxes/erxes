import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { ITemplateCategoryDocument } from '../../@types';

export const templateCategorySchema = schemaWrapper(
  new Schema<ITemplateCategoryDocument>(
    {
      name: { type: String, required: true },
      parentId: { type: String },
      code: { type: String, required: true },
      contentType: { type: String, required: true },

      createdBy: { type: String },
      updatedBy: { type: String },
    },
    {
      timestamps: true,
    },
  ),
);
