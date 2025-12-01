import { Schema, HydratedDocument } from 'mongoose';

export interface IRelatedTemplate {
  contentType: string;
  content: string[];
}

export interface ITemplate {
  _id: string;
  name: string;
  content: string;
  pluginType?: string;
  categoryIds?: string[];
  description?: string;
  contentType?: string;
  relatedTemplate?: IRelatedTemplate[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
  status: 'active' | 'inactive';
}

export interface ITemplateInput {
  name: string;
  content: string;
  contentType?: string;
  description?: string;
  pluginType?: string;
  categoryIds?: string[];
  status?: 'active' | 'inactive';
}

export interface ITemplateCategory {
  _id: string;
  name: string;
  order?: string;
  code: string;
  parentId?: string;
  contentType: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  status?: 'active' | 'inactive';
}

export type TemplateDocument = HydratedDocument<ITemplate>;
export type TemplateCategoryDocument = HydratedDocument<ITemplateCategory>;

export const relatedTemplate = new Schema(
  {
    contentType: { type: String, required: true },
    content: { type: [String], required: true },
  },
  { _id: false },
);

export const templateSchema = new Schema<TemplateDocument>(
  {
    _id: { type: String },
    name: { type: String, required: true },
    content: { type: String, required: true },
    pluginType: { type: String },
    categoryIds: { type: [String], default: [] },
    description: { type: String },
    contentType: { type: String },
    relatedTemplate: {
      type: [relatedTemplate],
      default: [],
    },
    createdBy: {
      type: String,
      index: true,
    },
    updatedBy: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true, _id: false },
);

templateSchema.pre('save', function (next) {
  if (!this._id) {
    this._id =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  next();
});

templateSchema.index({ status: 1, createdAt: -1 });
templateSchema.index({ createdBy: 1, status: 1 });

export const templateCategorySchema = new Schema<TemplateCategoryDocument>(
  {
    name: { type: String, required: true },
    order: { type: String },
    parentId: { type: String },
    code: { type: String, required: true, unique: true },
    contentType: { type: String, required: true },
    createdBy: {
      type: String,
      index: true,
    },
    updatedBy: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true },
);

templateCategorySchema.index({ status: 1, createdAt: -1 });
templateCategorySchema.index({ code: 1 });
templateCategorySchema.index({ parentId: 1 });
