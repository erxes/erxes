import { templateInstallationSchema } from '@/template/db/definitions/installation';
import {
  findAvailableTemplate,
  getTemplateNodeDetails,
} from '@/template/registry';
import {
  AUTOMATION_STATUSES,
  TTemplateAnswers,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { installTemplate, createTemplatePartsApi } from '../utils';
import { CORE_TEMPLATE_PARTS } from '../constants';
import { Model } from 'mongoose';

export interface ITemplateInstallation {
  templateId: string;
  pluginName: string;
  version: number;
  name: string;
  answers: TTemplateAnswers;
  partIds: Record<string, string>;
  parts?: TInstalledPart[];
  automationIds: Record<string, string>;
  createdBy?: string;
}

export type TInstalledPart = {
  key: string;
  type: string;
  _id: string;
  refs?: Record<string, string>;
  // A segment no journey reads: the template's own deliverable, listed
  listed?: boolean;
};

export interface ITemplateInstallationDocument
  extends ITemplateInstallation,
    Document {
  _id: string;
  createdAt: Date;
}

export interface ITemplateInstallationModel
  extends Model<ITemplateInstallationDocument> {
  install(input: {
    pluginName: string;
    templateId: string;
    answers: TTemplateAnswers;
    userId: string;
  }): Promise<ITemplateInstallationDocument>;
  removeInstallation(
    _id: string,
  ): Promise<{ success: true; kept: { key: string; reason?: string }[] }>;
}

export const loadTemplateInstallationClass = (
  models: IModels,
  subdomain: string,
) => {
  class TemplateInstallation {
    public static async install({
      pluginName,
      templateId,
      answers,
      userId,
    }: {
      pluginName: string;
      templateId: string;
      answers: TTemplateAnswers;
      userId: string;
    }) {
      return installTemplate({
        models,
        template: await findAvailableTemplate(pluginName, templateId),
        answers,
        userId,
        nodes: await getTemplateNodeDetails(),
        partsApi: createTemplatePartsApi(models, subdomain),
      });
    }

    /**
     * Removes what an install created while none of it is live; an active
     * automation is switched off first, on purpose.
     */
    public static async removeInstallation(_id: string) {
      const installation = await models.TemplateInstallations.findOne({
        _id,
      }).lean();

      if (!installation) {
        throw new Error('Installation not found');
      }

      const automationIds = Object.values(installation.automationIds || {});
      const activeCount = await models.Automations.countDocuments({
        _id: { $in: automationIds },
        status: AUTOMATION_STATUSES.ACTIVE,
      });

      if (activeCount) {
        throw new Error(
          'Turn off the automations this installation created before removing it',
        );
      }

      await models.Automations.removeAutomations(automationIds);

      // Kept while something someone moved in still sits there
      const folders = await models.AutomationFolders.find(
        { installationId: _id },
        { _id: 1 },
      ).lean();

      for (const folder of folders) {
        await models.AutomationFolders.removeIfEmpty(folder._id);
      }

      const partsApi = createTemplatePartsApi(models, subdomain);
      // Installed before parts were recorded: their parts are AI agents
      const parts: TInstalledPart[] =
        installation.parts ||
        Object.entries(installation.partIds || {}).map(([key, partId]) => ({
          key,
          type: CORE_TEMPLATE_PARTS.AI_AGENT_PART,
          _id: partId,
        }));
      const kept: { key: string; reason?: string }[] = [];

      for (const part of parts) {
        const { removed, reason } = await partsApi.remove(part);
        if (!removed) kept.push({ key: part.key, reason });
      }

      await models.TemplateInstallations.deleteOne({ _id });

      return { success: true as const, kept };
    }
  }

  templateInstallationSchema.loadClass(TemplateInstallation);

  return templateInstallationSchema;
};
