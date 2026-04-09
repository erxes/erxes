import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  CMS_DEFAULT_POST_URL_FIELD,
  CMS_POST_URL_FIELDS,
  CMSPostUrlField,
  IContentCMSDocument,
  IContentCMSInput,
} from '@/cms/@types/cms';
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
    private static normalizePostUrlField(
      postUrlField?: string,
    ): CMSPostUrlField {
      if (
        postUrlField &&
        CMS_POST_URL_FIELDS.includes(postUrlField as CMSPostUrlField)
      ) {
        return postUrlField as CMSPostUrlField;
      }

      return CMS_DEFAULT_POST_URL_FIELD;
    }

    public static async getContentCMS(_id: string) {
      return models.CMS.findOne({ _id });
    }
    public static async getContentCMSs() {
      const data = await models.CMS.find();
      return data;
    }
    public static async createContentCMS(doc: IContentCMSInput) {
      return models.CMS.create({
        ...doc,
        postUrlField: this.normalizePostUrlField(doc.postUrlField),
      });
    }
    public static async updateContentCMS(_id: string, doc: IContentCMSInput) {
      return models.CMS.findOneAndUpdate(
        { _id },
        {
          ...doc,
          postUrlField: this.normalizePostUrlField(doc.postUrlField),
        },
        { new: true },
      );
    }
    public static async deleteContentCMS(_id: string) {
      return models.CMS.findOneAndDelete({ _id });
    }
  }
  cmsSchema.loadClass(CMS);

  return cmsSchema;
};
