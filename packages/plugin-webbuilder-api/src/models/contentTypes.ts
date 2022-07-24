import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IField {
  code: string;
  text: string;
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
    text: { type: String },
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
  removeContentType(_id: string): void;
}

export const loadTypeClass = (models: IModels) => {
  class ContentType {
    public static async checkCodeDuplication(code: string, id?: string) {
      const query: { [key: string]: any } = {
        code
      };

      if (id) {
        query._id = { $ne: id };
      }

      const contentType = await models.ContentTypes.findOne(query);

      if (contentType) {
        throw new Error('Code duplicated!');
      }
    }

    public static async createContentType(doc: IContentType) {
      await this.checkCodeDuplication(doc.code);

      return models.ContentTypes.create(doc);
    }

    public static async updateContentType(_id: string, doc: IContentType) {
      await this.checkCodeDuplication(doc.code, _id);

      await models.ContentTypes.updateOne({ _id }, { $set: doc });

      return models.ContentTypes.findOne({ _id });
    }

    public static async removeContentType(_id: string) {
      // remove entries which belongs to this contentType
      await models.Entries.deleteMany({ contentTypeId: _id });

      return models.ContentTypes.deleteOne({ _id });
    }
  }

  contentTypeSchema.loadClass(ContentType);

  return contentTypeSchema;
};
