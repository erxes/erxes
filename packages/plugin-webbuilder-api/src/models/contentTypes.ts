import { Model } from 'mongoose';
import * as _ from 'underscore';
import { Document, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from './utils';

export interface IField {
  code: string;
  text: string;
  type: string;
  show: boolean;
}

export interface IContentType {
  siteId: string;
  code: string;
  displayName: string;
  fields: IField[];
}

export interface IContentTypeDocument extends IContentType, Document {
  _id: string;
}

export const fieldSchema = new Schema(
  {
    code: field({ type: String }),
    text: field({ type: String }),
    type: field({ type: String }),
    show: field({ type: Boolean })
  },
  { _id: false }
);

export const contentTypeSchema = new Schema({
  _id: field({ pkey: true }),
  siteId: field({ type: String, optional: true, label: 'Site Id' }),
  code: field({ type: String, label: 'Name' }),
  displayName: field({ type: String, label: 'Description' }),
  fields: field({ type: [fieldSchema] })
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
    public static async checkDuplication(
      code: string,
      siteId: string,
      id?: string
    ) {
      const query: { [key: string]: any } = {
        code,
        siteId
      };

      if (id) {
        query._id = { $ne: id };
      }

      const contentType = await models.ContentTypes.findOne(query);

      if (contentType) {
        throw new Error('Site and code duplicated!');
      }
    }

    public static async createContentType(doc: IContentType) {
      await this.checkDuplication(doc.code, doc.siteId);

      return models.ContentTypes.create(doc);
    }

    public static async updateContentType(_id: string, doc: IContentType) {
      await this.checkDuplication(doc.code, doc.siteId, _id);

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
