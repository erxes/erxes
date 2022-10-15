import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  contentTypeSchema,
  IContentType,
  IContentTypeDocument
} from './definitions/contentTypes';
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
