import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const apiSchema = new Schema(
  {
    image: { type: String, optional: true },
    address: { type: String, optional: true },
    port: { type: Number, optional: true },
    health: { type: String, optional: true },
    env: { type: [String], optional: true },
    hasSubscriptions: { type: Boolean, optional: true },
  },
  { _id: false },
);

const uiSchema = new Schema(
  {
    remote: { type: String },
    entry: { type: String },
    exposes: { type: [String], optional: true },
  },
  { _id: false },
);

export const pluginInstallSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, required: true, index: true },
      version: { type: String, default: 'latest' },
      description: { type: String, optional: true },
      icon: { type: String, optional: true },
      source: {
        type: String,
        enum: ['catalog', 'github'],
        required: true,
      },
      repoUrl: { type: String, optional: true },
      api: { type: apiSchema, optional: true },
      ui: { type: uiSchema, optional: true },
      enabled: { type: Boolean, default: true },
    },
    { timestamps: true },
  ),
);
