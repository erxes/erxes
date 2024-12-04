import { Model } from 'mongoose';
import {
  ITemplate,
  TemplateDocument,
  templateSchema
} from './definitions/templates';
import { getRelatedContents } from '../utils';

type ITemplateDocument = Omit<
  ITemplate,
  '_id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export interface ITemplateModal extends Model<TemplateDocument> {
  getTemplate(_id: string): Promise<TemplateDocument>;
  createTemplate(
    doc: ITemplateDocument,
    subdomain: any,
    user?: any
  ): Promise<TemplateDocument>;
  updateTemplate(
    _id: string,
    doc: ITemplateDocument,
    user?: any
  ): Promise<TemplateDocument>;
  removeTemplate(_id: string): Promise<TemplateDocument>;
}

export const loadTemplateClass = (models) => {
  class Template {
    /*
     * Get a template
     */
    public static async getTemplate(_id: string) {
      const template = await models.Templates.findOne({ _id }).lean();

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    }

    /*
     * Create a template
     */
    public static async createTemplate(
      doc: ITemplateDocument,
      _subdomain: any,
      user?: any
    ) {

      const templateObject = {
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?._id
      }

      const relatedContents = await getRelatedContents(doc, _subdomain)

      if ((relatedContents || []).length) {
        Object.assign(templateObject, { relatedContents: relatedContents })
      }

      const template = await models.Templates.create(templateObject);

      if (!template) {
        throw new Error('Template not created');
      }

      return template;
    }

    /*
     * Update a template
     */
    public static async updateTemplate(
      _id,
      doc: ITemplateDocument,
      user?: any
    ) {
      const template = await models.Templates.findOne({ _id });

      if (!template) {
        throw new Error('Template not created');
      }

      return await models.Templates.findOneAndUpdate(
        { _id },
        {
          ...doc,
          updatedAt: new Date(),
          updatedBy: user?._id
        },
        { new: true }
      );
    }

    /*
     * Remove a template
     */
    public static async removeTemplate(_id: string) {
      const template = await models.Templates.findOneAndDelete({ _id });

      if (!template) {
        throw new Error(`Template not found with id ${_id}`);
      }

      return template;
    }
  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
