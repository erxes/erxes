import { Model } from 'mongoose';
import {
  IPipelineTemplateDocument,
  IPipelineTemplateStage,
  pipelineTemplateSchema
} from './definitions/pipelineTemplates';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';

interface IDoc {
  name: string;
  description?: string;
  type: string;
}

export const getDuplicatedStages = async (models: IModels, subdomain: string, {
  templateId,
  pipelineId,
  type
}: {
  templateId: string;
  pipelineId?: string;
  type?: string;
}) => {
  const template = await models.PipelineTemplates.getPipelineTemplate(templateId);

  const stages: any[] = [];

  for (const stage of template.stages) {
    const duplicated = await sendFormsMessage({ subdomain, action: 'duplicate', data: stage.formId, isRPC: true });

    stages.push({
      _id: Math.random().toString(),
      name: stage.name,
      pipelineId,
      type,
      formId: duplicated._id
    });
  }

  return stages;
};

export interface IPipelineTemplateModel
  extends Model<IPipelineTemplateDocument> {
  getPipelineTemplate(_id: string): Promise<IPipelineTemplateDocument>;
  createPipelineTemplate(
    doc: IDoc,
    stages: IPipelineTemplateStage[]
  ): Promise<IPipelineTemplateDocument>;
  updatePipelineTemplate(
    _id: string,
    doc: IDoc,
    stages: IPipelineTemplateStage[]
  ): Promise<IPipelineTemplateDocument>;
  removePipelineTemplate(_id: string): void;
  duplicatePipelineTemplate(_id: string): Promise<IPipelineTemplateDocument>;
}

export const loadPipelineTemplateClass = (models: IModels, subdomain: string) => {
  class PipelineTemplate {
    /*
     * Get a pipeline template
     */
    public static async getPipelineTemplate(_id: string) {
      const pipelineTemplate = await models.PipelineTemplates.findOne({ _id });

      if (!pipelineTemplate) {
        throw new Error('Pipeline template not found');
      }

      return pipelineTemplate;
    }

    /**
     * Create a pipeline template
     */
    public static async createPipelineTemplate(
      doc: IDoc,
      stages: IPipelineTemplateStage[]
    ) {
      const orderedStages = stages.map((stage, index) => ({ ...stage, index }));

      return models.PipelineTemplates.create({ ...doc, stages: orderedStages });
    }

    /**
     * Update pipeline template
     */
    public static async updatePipelineTemplate(
      _id: string,
      doc: IDoc,
      stages: IPipelineTemplateStage[]
    ) {
      const orderedStages = stages.map((stage, index) => ({ ...stage, index }));

      await models.PipelineTemplates.updateOne(
        { _id },
        { $set: { ...doc, stages: orderedStages } }
      );

      return models.PipelineTemplates.findOne({ _id });
    }

    /**
     * Duplicate pipeline template
     */
    public static async duplicatePipelineTemplate(_id: string) {
      const pipelineTemplate = await models.PipelineTemplates.findOne({ _id }).lean();

      if (!pipelineTemplate) {
        throw new Error('Pipeline template not found');
      }

      const duplicated: IDoc = {
        name: `${pipelineTemplate.name} duplicated`,
        description: pipelineTemplate.description || '',
        type: pipelineTemplate.type
      };

      const stages: any[] = await getDuplicatedStages(models, subdomain, {
        templateId: pipelineTemplate._id
      });

      return models.PipelineTemplates.createPipelineTemplate(duplicated, stages);
    }

    /**
     * Remove pipeline template
     */
    public static async removePipelineTemplate(_id: string) {
      const pipelineTemplate = await models.PipelineTemplates.findOne({ _id });

      if (!pipelineTemplate) {
        throw new Error('Pipeline template not found');
      }

      for (const stage of pipelineTemplate.stages) {
        sendFormsMessage({ subdomain, action: 'removeForm', data: { formId: stage.formId } });
      }

      return models.PipelineTemplates.deleteOne({ _id });
    }
  }

  pipelineTemplateSchema.loadClass(PipelineTemplate);

  return pipelineTemplateSchema;
};