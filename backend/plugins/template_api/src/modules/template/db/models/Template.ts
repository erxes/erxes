import { Model } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  ITemplate,
  ITemplateInput,
  TemplateDocument,
  templateSchema,
} from '../definitions/template';
import { IModels } from '~/connectionResolvers';

export interface ITemplateModel extends Model<TemplateDocument> {
  getTemplate(_id: string): Promise<TemplateDocument>;
  createTemplate(
    doc: ITemplateInput,
    user?: IUserDocument,
  ): Promise<TemplateDocument>;
  updateTemplate(
    _id: string,
    doc: Partial<ITemplateInput>,
    user?: IUserDocument,
  ): Promise<TemplateDocument>;
  removeTemplate(_id: string): Promise<TemplateDocument>;
}

export const loadTemplateClass = (models: IModels) => {
  class Template {
    public static async getTemplate(_id: string): Promise<TemplateDocument> {
      const template = await models.Template.findOne({ _id });
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    }

    public static async createTemplate(
      this: ITemplateModel,
      doc: ITemplateInput,
      user?: IUserDocument,
    ): Promise<TemplateDocument> {
      const toCreate: Partial<ITemplate> = {
        ...doc,
        createdBy: user?._id,
      };

      return this.create(toCreate);
    }

    public static async updateTemplate(
      this: ITemplateModel,
      _id: string,
      doc: Partial<ITemplateInput>,
      user?: IUserDocument,
    ): Promise<TemplateDocument> {
      await models.Template.getTemplate(_id);

      const updated = await models.Template.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...doc,
            updatedBy: user?._id,
          },
        },
        { new: true },
      );

      if (!updated) throw new Error('Failed to update template');
      return updated;
    }

    public static async removeTemplate(
      this: ITemplateModel,
      _id: string,
    ): Promise<TemplateDocument> {
      console.log('_id', _id);

      const template = await this.findOne({ _id });
      if (!template) {
        throw new Error(`Template not found with id ${_id}`);
      }
      await models.Template.findOneAndDelete({ _id });
      return template;
    }
  }

  templateSchema.loadClass(Template);
  return templateSchema;
};
