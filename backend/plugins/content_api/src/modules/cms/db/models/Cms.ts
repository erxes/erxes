import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IContentCMSDocument, IContentCMSInput } from '@/cms/@types/cms';
import { cmsSchema } from '@/cms/db/definitions/cms';

export interface ICMSModel extends Model<IContentCMSDocument> {
  getContentCMS(_id: string): Promise<IContentCMSDocument>;
  getContentCMSs(): Promise<IContentCMSDocument[]>;
  createContentCMS(doc: IContentCMSInput): Promise<IContentCMSDocument>;
  updateContentCMS(
    _id: string,
    doc: IContentCMSInput,
  ): Promise<IContentCMSDocument>;
  deleteContentCMS(_id: string): Promise<boolean>;
}

export const loadCmsClass = (models: IModels) => {
  class CMS {
    public static async getContentCMS(_id: string) {
      return models.CMS.findOne({ _id });
    }
    public static async getContentCMSs() {
      return models.CMS.find();
    }
    public static async createContentCMS(doc: IContentCMSInput) {
      return models.CMS.create(doc);
    }
    public static async updateContentCMS(_id: string, doc: IContentCMSInput) {
      return models.CMS.findOneAndUpdate({ _id }, doc, { new: true });
    }
    public static async deleteContentCMS(_id: string) {
      return models.CMS.findOneAndDelete({ _id });
    }
  }
  cmsSchema.loadClass(CMS);

  return cmsSchema;
};
