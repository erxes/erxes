import { Model, model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';

export interface IField {
  code: string;
  label: string;
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
    label: { type: String }
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

class ContentType {
  public static async createContentType(doc) {
    return ContentTypes.create(doc);
  }

  public static async updateContentType(_id: string, doc) {
    return ContentTypes.updateOne({ _id }, { $set: doc });
  }

  public static async remoteContentType(_id) {
    return ContentTypes.deleteOne({ _id });
  }
}

contentTypeSchema.loadClass(ContentType);

const ContentTypes = model<IContentTypeDocument, IContentTypeModel>(
  'webbuilder_contenttypes',
  contentTypeSchema
);

export { ContentTypes };
