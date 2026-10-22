import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import type { IDataModelDefinitionDocument } from '../../types';

export const dataModelDefinitionSchema = schemaWrapper(
  new Schema<IDataModelDefinitionDocument>(
    {
      name: {
        type: String,
        required: true,
        immutable: true,
        match: /^[a-z][a-z0-9_]{0,62}$/,
      },
      labelSingular: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      labelPlural: { type: String, required: true, trim: true, maxlength: 100 },
      description: { type: String, default: '', maxlength: 2000 },
      icon: { type: String, required: true, default: 'IconDatabase' },
      source: {
        type: String,
        enum: ['BUILTIN', 'CUSTOM'],
        default: 'CUSTOM',
        immutable: true,
      },
      recordLabelField: { type: String, default: null },
      recordImageField: { type: String, default: null },
      version: { type: Number, required: true, default: 1, min: 1 },
      createdBy: { type: String, required: true, immutable: true },
      updatedBy: { type: String, required: true },
      archivedAt: { type: Date, default: null },
      archivedBy: { type: String, default: null },
    },
    { timestamps: true },
  ),
);

// Archived names stay reserved, so integrations never resolve a name to a new model.
dataModelDefinitionSchema.index({ name: 1 }, { unique: true });
dataModelDefinitionSchema.index({ archivedAt: 1, name: 1 });
