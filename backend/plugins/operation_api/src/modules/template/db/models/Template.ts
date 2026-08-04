
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { 
  IOperationTemplateDocument, 
  IOperationTemplateAdd, 
  IOperationTemplateEdit 
} from '../../@types/template';
import { operationTemplateSchema } from '../definitions/template';

export interface IOperationTemplateModel extends Model<IOperationTemplateDocument> {
  getTemplate(_id: string): Promise<IOperationTemplateDocument>;
  addTemplate(doc: IOperationTemplateAdd, userId: string): Promise<IOperationTemplateDocument>;
  editTemplate(doc: IOperationTemplateEdit): Promise<IOperationTemplateDocument>;
  removeTemplate(_id: string): Promise<void>;
}

export const loadTemplateClass = (models: IModels) => {
  class OperationTemplate {
    public static async getTemplate(_id: string) {
      const template = await models.OperationTemplate.findOne({ _id });

      if (!template) {
        throw new Error('Template not found');
      }

      return template;
    }

    public static async addTemplate(doc: IOperationTemplateAdd, userId: string) {
      return models.OperationTemplate.create({
        ...doc,
        createdBy: userId,
      });
    }

    public static async editTemplate(doc: IOperationTemplateEdit) {
      const { _id, ...updateDoc } = doc;
      
      const template = await models.OperationTemplate.findOne({ _id });
      if (!template) {
        throw new Error('Template not found');
      }

      await models.OperationTemplate.updateOne({ _id }, { $set: updateDoc });
      return models.OperationTemplate.findOne({ _id });
    }

    public static async removeTemplate(_id: string) {
      const template = await models.OperationTemplate.findOne({ _id });
      if (!template) {
        throw new Error('Template not found');
      }

      return models.OperationTemplate.deleteOne({ _id });
    }
  }

  operationTemplateSchema.loadClass(OperationTemplate);

  return operationTemplateSchema;
};
