import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

import { IWebMenuItemDocument } from '@/webbuilder/@types/webMenu';

export const webMenuSchema = new Schema<IWebMenuItemDocument>(
  {
    _id: mongooseStringRandomId,
    parentId: { type: String },
    webId: { type: String, required: true },
    clientPortalId: { type: String, required: true },
    label: { type: String, required: true },
    objectType: { type: String },
    objectId: { type: String },
    kind: { type: String },
    icon: { type: String },
    url: { type: String },
    order: { type: Number },
    target: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

webMenuSchema.index(
  { webId: 1, clientPortalId: 1, kind: 1, order: 1 },
  { sparse: true },
);

