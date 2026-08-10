import { Document, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { automationWorkflowTemplateSchema } from '@/automations/db/definitions/automationWorkflowTemplate';

export interface IAutomationWorkflowTemplate {
  name: string;
  description?: string;
  entryActionId?: string;
  actions: Record<string, any>[];
  inputs?: Record<string, string>;
  createdBy?: string;
}

export interface IAutomationWorkflowTemplateDocument
  extends IAutomationWorkflowTemplate,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAutomationWorkflowTemplateModel
  extends Model<IAutomationWorkflowTemplateDocument> {
  getWorkflowTemplate(
    _id: string,
  ): Promise<IAutomationWorkflowTemplateDocument>;
  createWorkflowTemplate(
    doc: IAutomationWorkflowTemplate,
  ): Promise<IAutomationWorkflowTemplateDocument>;
  updateWorkflowTemplate(
    _id: string,
    doc: Partial<IAutomationWorkflowTemplate>,
  ): Promise<IAutomationWorkflowTemplateDocument>;
  removeWorkflowTemplate(_id: string): Promise<any>;
}

export const loadAutomationWorkflowTemplateClass = (models: IModels) => {
  class AutomationWorkflowTemplate {
    public static async getWorkflowTemplate(_id: string) {
      const template = await models.AutomationWorkflowTemplates.findOne({
        _id,
      });

      if (!template) {
        throw new Error('Workflow template not found');
      }

      return template;
    }

    public static async createWorkflowTemplate(
      doc: IAutomationWorkflowTemplate,
    ) {
      return models.AutomationWorkflowTemplates.create({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    public static async updateWorkflowTemplate(
      _id: string,
      doc: Partial<IAutomationWorkflowTemplate>,
    ) {
      await models.AutomationWorkflowTemplates.getWorkflowTemplate(_id);

      await models.AutomationWorkflowTemplates.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      return models.AutomationWorkflowTemplates.getWorkflowTemplate(_id);
    }

    public static async removeWorkflowTemplate(_id: string) {
      await models.AutomationWorkflowTemplates.getWorkflowTemplate(_id);

      return models.AutomationWorkflowTemplates.deleteOne({ _id });
    }
  }

  automationWorkflowTemplateSchema.loadClass(AutomationWorkflowTemplate);

  return automationWorkflowTemplateSchema;
};
