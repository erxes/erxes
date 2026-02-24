import {
  ICMSMenuDocument,
  ICMSPageDocument,
  IContentCMSDocument,
} from '@/cms/@types/cms';
import { customFieldSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import mongoose, { Schema } from 'mongoose';

export const cmsSchema = new mongoose.Schema<IContentCMSDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    clientPortalId: { type: String, required: true },
    content: { type: String, required: true },
    language: { type: String, optional: true },
    languages: { type: [String], optional: true },
  },
  { timestamps: true },
);

export const cmsMenuSchema = new mongoose.Schema<ICMSMenuDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    label: { type: String, required: true },
    objectType: { type: String },
    objectId: { type: String },
    kind: { type: String, required: true },
    icon: { type: String },
    url: { type: String },
    parentId: { type: String },
    order: { type: Number, required: true },
    target: { type: String, default: '_self' },
  },
  { timestamps: true },
);

export const cmsPageSchema = new mongoose.Schema<ICMSPageDocument>(
  {
    _id: mongooseStringRandomId,
    clientPortalId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    content: { type: String },
    slug: { type: String, required: true },
    layout: { type: String, required: false },
    status: { type: String },
    createdUserId: { type: String, ref: 'User' },
    coverImage: { type: String },
    customFieldsData: { type: [customFieldSchema], optional: true },
    pageItems: [
      {
        _id: mongooseStringRandomId,
        name: { type: String },
        type: { type: String, required: true },
        content: { type: Schema.Types.Mixed },
        order: { type: Number, required: true },
        objectType: { type: String },
        objectId: { type: String },
        config: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true },
);
