import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IField {
  code: string;
  label: string;
  type: string;
}

export interface IContentType {
  code: string;
  displayName: string;
  fields: IField[];
}

export interface IContentTypeDocument extends IContentType, Document {
  _id: string;
}

export const fieldSchema = new Schema(
  {
    code: { type: String },
    label: { type: String },
    type: { type: String }
  },
  { _id: false }
);

export const contentTypeSchema = new Schema({
  code: { type: String, label: 'Name' },
  displayName: { type: String, label: 'Description' },
  fields: { type: [fieldSchema] }
});

export interface IContentTypeModel extends Model<IContentTypeDocument> {
  createContentType(doc: IContentType): Promise<IContentTypeDocument>;
  updateContentType(
    _id: string,
    doc: IContentType
  ): Promise<IContentTypeDocument>;
}

export const loadTypeClass = (models: IModels) => {
  class ContentType {
    public static async createContentType(doc) {
      return models.ContentTypes.create(doc);
    }

    public static async updateContentType(_id: string, doc) {
      return models.ContentTypes.updateOne({ _id }, { $set: doc });
    }

    public static async remoteContentType(_id) {
      return models.ContentTypes.deleteOne({ _id });
    }
  }

  contentTypeSchema.loadClass(ContentType);

  return contentTypeSchema;
};
