import { Schema, HydratedDocument } from "mongoose"
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types'

export interface IRelatedContent {
    contentType: string;
    content: string[];
}

export interface ITemplate {
    _id: string;
    name: string;
    description: string;
    contentId: string;
    contentType: string;
    content: string
    relatedContents: IRelatedContent[];

    createdAt: Date;
    createdBy: string;

    updatedAt: Date;
    updatedBy: string;

    categoryIds: string[];
}

export interface ITemplateCategory {
    _id: string;
    name: string;
    parentId: string;
    order: string;
    code: string;
    contentType: string;

    createdAt: Date;
    createdBy: string;

    updatedAt: Date;
    updatedBy: string;
}

export type TemplateDocument = HydratedDocument<ITemplate>;

export type TemplateCategoryDocument = HydratedDocument<ITemplateCategory>;

export const relatedContent = new Schema(
    {
        contentType: { type: String, required: true },
        content: { type: [String], required: true },
    },
    { _id: false }
);

export const templateSchema = new Schema<TemplateDocument>(
    {
        _id: stringRandomId,
        name: { type: String, required: true },
        description: { type: String },
        content: { type: String, required: true },
        contentType: { type: String, required: true },
        relatedContents: { type: [relatedContent], default: [], optional: true },

        categoryIds: { type: [String], optional: true },

        createdAt: { type: Date, default: Date.now(), required: true },
        createdBy: { type: String },
        updatedAt: { type: Date },
        updatedBy: { type: String }
    },
    { timestamps: true }
)

export const templateCategorySchema = new Schema<TemplateCategoryDocument>(
    {
        _id: stringRandomId,
        name: { type: String, required: true },
        parentId: { type: String },
        order: { type: String, required: true },
        code: { type: String, required: true },
        contentType: { type: String, required: true },

        createdAt: { type: Date, default: Date.now(), required: true },
        createdBy: { type: String },
        updatedAt: { type: Date },
        updatedBy: { type: String }
    }
)