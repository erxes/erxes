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

  createdBy?: string;
  modifiedBy?: string;
}

export interface IContentTypeDocument extends IContentType, Document {
  _id: string;

  createdAt: Date;
  modifiedAt: Date;
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
  siteId: field({ type: String, optional: true, label: 'Site Id' }),
  code: field({ type: String, label: 'Name' }),
  displayName: field({ type: String, label: 'Description' }),
  fields: field({ type: [fieldSchema] }),

  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  modifiedBy: field({ type: String, optional: true, label: 'Modified by' }),

  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  modifiedAt: field({ type: Date, label: 'Modified at', esType: 'date' })
});

export interface IContentTypeModel extends Model<IContentTypeDocument> {
  createContentType(
    doc: IContentType,
    userId: string
  ): Promise<IContentTypeDocument>;
  updateContentType(
    _id: string,
    doc: IContentType,
    userId: string
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

    public static async createContentType(doc: IContentType, userId: string) {
      await this.checkDuplication(doc.code, doc.siteId);

      return models.ContentTypes.create({
        ...doc,
        createdBy: userId,
        createdAt: new Date()
      });
    }

    public static async updateContentType(
      _id: string,
      doc: IContentType,
      userId: string
    ) {
      await this.checkDuplication(doc.code, doc.siteId, _id);

      await models.ContentTypes.updateOne(
        { _id },
        { $set: { ...doc, modifiedBy: userId, modifiedAt: new Date() } }
      );

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
