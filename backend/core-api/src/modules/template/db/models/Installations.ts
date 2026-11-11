import {
  AUTOMATION_STATUSES,
  getUnansweredTemplateRequirements,
  IAutomation,
  materializeTemplate,
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplateAnswers,
} from 'erxes-api-shared/core-modules';
import { Document, Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { templateInstallationSchema } from '@/template/db/definitions/installation';
import {
  findAvailableTemplate,
  getTemplateNodeDetails,
  TRegisteredTemplate,
  TTemplateNodeDetails,
} from '@/template/registry';

export interface ITemplateInstallation {
  templateId: string;
  pluginName: string;
  version: number;
  name: string;
  answers: TTemplateAnswers;
  partIds: Record<string, string>;
  automationIds: Record<string, string>;
  createdBy?: string;
}

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
  removeInstallation(_id: string): Promise<{ success: true }>;
}

/**
 * Answers as the materializer needs them. An AI agent answer becomes that
 * agent's connection, so the key is copied server side and never travels
 * through the wizard; what is stored keeps only the agent's id.
 */
export const resolveTemplateAnswers = async (
  models: IModels,
  template: TRegisteredTemplate,
  answers: TTemplateAnswers,
) => {
  const resolved: TTemplateAnswers = { ...answers };

  for (const { key, kind } of template.requirements) {
    if (kind !== TEMPLATE_CORE_REQUIREMENT_KINDS.AI_AGENT) {
      continue;
    }

    const agent = await models.AiAgents.findOne(
      { _id: String(answers[key] ?? '') },
      { connection: 1 },
    ).lean();

    if (!agent) {
      throw new Error('The chosen AI agent no longer exists');
    }

    resolved[key] = { _id: agent._id, connection: agent.connection };
  }

  return resolved;
};

/**
 * Creates everything a template declares in one go: its parts, then one
 * draft automation per journey. Anything created is removed again when a
 * later step fails, so an install is whole or absent.
 */
export const installTemplate = async ({
  models,
  template,
  answers,
  userId,
  nodes,
}: {
  models: IModels;
  template: TRegisteredTemplate;
  answers: TTemplateAnswers;
  userId: string;
  nodes: Map<string, TTemplateNodeDetails>;
}) => {
  const { pluginName } = template;
  const unanswered = getUnansweredTemplateRequirements(template, answers);

  if (unanswered.length) {
    throw new Error(
      `Answer every step first: ${unanswered
        .map(({ label }) => label)
        .join(', ')}`,
    );
  }

  const resolved = await resolveTemplateAnswers(models, template, answers);
  const installationId = nanoid();
  const partIds = Object.fromEntries(
    template.parts.map(({ key }) => [key, nanoid()]),
  );
  const { parts, automations } = materializeTemplate(template, {
    answers: resolved,
    partIds,
  });

  const createdAgentIds: string[] = [];
  const automationIds: Record<string, string> = {};

  try {
    for (const part of parts) {
      await models.AiAgents.createAgent({
        ...part.doc,
        _id: partIds[part.key],
      });
      createdAgentIds.push(partIds[part.key]);
    }

    for (const automation of automations) {
      const created = await models.Automations.createAutomation(
        {
          name: automation.name,
          status: AUTOMATION_STATUSES.DRAFT,
          triggers: automation.triggers.map((trigger) => {
            const node = nodes.get(trigger.type) || {};

            return {
              ...trigger,
              isCustom: !!node.isCustom,
              label: node.label || '',
              icon: node.icon,
              description: node.description || '',
            };
          }) as unknown as IAutomation['triggers'],
          actions: automation.actions.map((action) => ({
            ...action,
            label: action.label || nodes.get(action.type)?.label || '',
            icon: action.icon || nodes.get(action.type)?.icon,
          })),
        } as IAutomation,
        userId,
      );

      // Automation ids are ObjectIds; kept as text like every other id here
      automationIds[automation.journey] = String(created._id);
    }

    return await models.TemplateInstallations.create({
      _id: installationId,
      templateId: template.id,
      pluginName,
      version: template.version,
      name: template.name,
      // As given: an AI agent answer is its id, never its connection
      answers,
      partIds,
      automationIds,
      createdBy: userId,
    });
  } catch (error) {
    await models.Automations.removeAutomations(
      Object.values(automationIds),
    ).catch(() => undefined);

    for (const agentId of createdAgentIds) {
      await models.AiAgents.removeAgent(agentId).catch(() => undefined);
    }

    throw error;
  }
};

export const loadTemplateInstallationClass = (models: IModels) => {
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

      for (const agentId of Object.values(installation.partIds || {})) {
        if (await models.AiAgents.exists({ _id: agentId })) {
          await models.AiAgents.removeAgent(agentId);
        }
      }

      await models.TemplateInstallations.deleteOne({ _id });

      return { success: true as const };
    }
  }

  templateInstallationSchema.loadClass(TemplateInstallation);

  return templateInstallationSchema;
};
