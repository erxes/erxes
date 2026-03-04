import { IUserDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITemplate, ITemplateDocument } from '../../@types';
import { getRelatedContents } from '../../utils';
import { templateSchema } from '../definitions/template';

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
      if (!template.contentId || !template.contentType) {
        throw new Error('Content ID and Content Type are required');
      }

      template.createdBy = user._id;

      const [pluginName, moduleName] = template.contentType.split(':');

      if (!pluginName || !moduleName) {
        throw new Error('Invalid content type format');
      }

      const content = await sendTRPCMessage({
        subdomain,
        pluginName,
        method: 'query',
        module: moduleName,
        action: 'template.getContent',
        input: { contentId: template.contentId },
        defaultValue: null,
      });

      if (!content) {
        throw new Error(`This ${moduleName} doesn't have content`);
      }

      template.content = content.content || content || '';

      const relatedContents =
        (await getRelatedContents(template, subdomain)) || [];

      if (relatedContents.length) {
        Object.assign(template, { relatedContents: relatedContents });
      }

      return models.Template.create(template);
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
