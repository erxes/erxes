import { Model } from 'mongoose';
import { ITemplate, ITemplateDocument } from '../../@types';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { templateSchema } from '../definitions/template';
import { getRelatedContents } from '../../utils';

export interface ITemplateModal extends Model<ITemplateDocument> {
  getTemplate(_id: string): Promise<ITemplateDocument>;
  createTemplate(
    template: ITemplate,
    user: IUserDocument,
  ): Promise<ITemplateDocument>;
  updateTemplate(
    _id: string,
    template: ITemplate,
    user?: IUserDocument,
  ): Promise<ITemplateDocument>;
  removeTemplates(_ids: string[]): Promise<void>;
}

export const loadTemplateClass = (models: IModels, subdomain: string) => {
  class Template {
    public static async getTemplate(_id: string) {
      const template = await models.Template.findOne({ _id }).lean();

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    }

    public static async createTemplate(
      template: ITemplate,
      user: IUserDocument,
    ) {
      const document = {
        ...template,
        createdBy: user._id,
      };

      const relatedContents =
        (await getRelatedContents(document, subdomain)) || [];

      if (relatedContents.length) {
        Object.assign(document, { relatedContents: relatedContents });
      }

      return models.Template.create(document);
    }

    public static async updateTemplate(
      _id: string,
      template: ITemplate,
      user: IUserDocument,
    ) {
      await models.Template.getTemplate(_id);

      return models.Template.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...template,
            updatedBy: user?._id,
          },
        },
        { new: true },
      );
    }

    public static async removeTemplates(_ids: string[]) {
      return models.Template.deleteMany({ _id: { $in: _ids } });
    }
  }

  templateSchema.loadClass(Template);

  return templateSchema;
};
