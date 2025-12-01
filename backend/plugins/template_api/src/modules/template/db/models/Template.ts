import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { templateSchema } from '@/template/db/definitions/template';
import { ITemplate, ITemplateDocument } from '@/template/@types/template';

export interface ITemplateModel extends Model<ITemplateDocument> {
  getTemplate(_id: string): Promise<ITemplateDocument>;
  getTemplates(): Promise<ITemplateDocument[]>;
  createTemplate(doc: ITemplate): Promise<ITemplateDocument>;
  updateTemplate(_id: string, doc: ITemplate): Promise<ITemplateDocument>;
  removeTemplate(TemplateId: string): Promise<{  ok: number }>;
}

export const loadTemplateClass = (models: IModels) => {
  class Template {
    /**
     * Retrieves template
     */
    public static async getTemplate(_id: string) {
      const Template = await models.Template.findOne({ _id }).lean();

      if (!Template) {
        throw new Error('Template not found');
      }

      return Template;
    }

    /**
     * Retrieves all templates
     */
    public static async getTemplates(): Promise<ITemplateDocument[]> {
      return models.Template.find().lean();
    }

    /**
     * Create a template
     */
    public static async createTemplate(doc: ITemplate): Promise<ITemplateDocument> {
      return models.Template.create(doc);
    }

    /*
     * Update template
     */
    public static async updateTemplate(_id: string, doc: ITemplate) {
      return await models.Template.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove template
     */
    public static async removeTemplate(TemplateId: string[]) {
      return models.Template.deleteOne({ _id: { $in: TemplateId } });
    }
  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
