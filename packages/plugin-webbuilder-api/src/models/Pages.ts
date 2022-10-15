import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IPage, IPageDocument, pageSchema } from './definitions/pages';

export interface IPageModel extends Model<IPageDocument> {
  checkDuplication(name: string): void;
  createPage(doc: IPage, userId: string): Promise<IPageDocument>;
  updatePage(_id: string, doc: IPage, userId: string): Promise<IPageDocument>;
  removePage(_id: string): Promise<IPageDocument>;
}

export const loadPageClass = (models: IModels) => {
  class Page {
    public static async checkDuplication(
      name: string,
      siteId: string,
      id?: string
    ) {
      const query: { [key: string]: any } = {
        name,
        siteId
      };

      if (id) {
        query._id = { $ne: id };
      }

      const page = await models.Pages.findOne(query);

      if (page) {
        throw new Error('Duplicated! Please change name or site.');
      }
    }

    public static async createPage(doc: IPage, userId: string) {
      await this.checkDuplication(doc.name, doc.siteId);

      return models.Pages.create({
        ...doc,
        createdBy: userId,
        createdAt: new Date()
      });
    }

    public static async updatePage(_id: string, doc: IPage, userId: string) {
      await this.checkDuplication(doc.name, doc.siteId, _id);

      await models.Pages.updateOne(
        { _id },
        { $set: { ...doc, modifiedBy: userId, modifiedAt: new Date() } }
      );

      return models.Pages.findOne({ _id });
    }

    public static async removePage(_id) {
      return models.Pages.deleteOne({ _id });
    }
  }

  pageSchema.loadClass(Page);

  return pageSchema;
};
