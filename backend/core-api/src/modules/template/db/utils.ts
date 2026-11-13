import { TRegisteredTemplate, TTemplateNodeDetails } from '@/template/registry';
import {
  AUTOMATION_STATUSES,
  getUnansweredTemplateRequirements,
  IAutomation,
  materializeTemplate,
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplateAnswers,
  TTemplatePartCreated,
  TTemplatePartProducers,
  TTemplatePartRemoved,
} from 'erxes-api-shared/core-modules';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { CORE_TEMPLATE_PARTS } from './constants';
import { TInstalledPart } from './models/Installations';
/**
 * Creates and removes parts: an AI agent here, anything else through the
 * plugin that owns its type, so core never writes another plugin's data.
 */
export type TTemplatePartsApi = {
  create: (input: {
    type: string;
    doc: Record<string, unknown>;
    userId: string;
  }) => Promise<TTemplatePartCreated>;
  remove: (part: TInstalledPart) => Promise<TTemplatePartRemoved>;
};

/**
 * `frontline:tickets.pipeline` → plugin `frontline`, part `tickets.pipeline`:
 * everything after the plugin is the type its owner registered.
 */
export const splitTemplatePartType = (templateType: string) => {
  const separator = templateType.indexOf(':');

  return {
    pluginName: templateType.slice(0, separator),
    partType: templateType.slice(separator + 1),
  };
};

export const createTemplatePartsApi = (
  models: IModels,
  subdomain: string,
): TTemplatePartsApi => ({
  create: async ({ type, doc, userId }) => {
    if (type === CORE_TEMPLATE_PARTS.AI_AGENT_PART) {
      const agent = await models.AiAgents.createAgent(doc);
      return { _id: String(agent._id) };
    }

    // Owned by the automations that use it: unlisted, never a name clash
    if (type === CORE_TEMPLATE_PARTS.SEGMENT_PART) {
      const segment = await models.Segments.createSegment(
        { ...doc, ownedBy: 'automation' } as Parameters<
          IModels['Segments']['createSegment']
        >[0],
        userId,
      );
      return { _id: String(segment._id) };
    }

    const { pluginName, partType } = splitTemplatePartType(type);
    const created = await sendCoreModuleProducer({
      subdomain,
      pluginName,
      moduleName: 'templates',
      producerName: TTemplatePartProducers.CREATE,
      input: { type: partType, doc, userId },
      defaultValue: null,
    });

    if (!created?._id) {
      throw new Error(`${pluginName} could not create "${partType}"`);
    }

    return created;
  },
  remove: async ({ type, _id, refs }) => {
    if (type === CORE_TEMPLATE_PARTS.AI_AGENT_PART) {
      if (await models.AiAgents.exists({ _id })) {
        await models.AiAgents.removeAgent(_id);
      }
      return { removed: true };
    }

    // Removing its automations may have removed it already
    if (type === CORE_TEMPLATE_PARTS.SEGMENT_PART) {
      if (await models.Segments.exists({ _id })) {
        await models.Segments.removeSegments([_id]);
      }
      return { removed: true };
    }

    const { pluginName, partType } = splitTemplatePartType(type);
    const removedPart = await sendCoreModuleProducer({
      subdomain,
      pluginName,
      moduleName: 'templates',
      producerName: TTemplatePartProducers.REMOVE,
      input: { type: partType, _id, refs },
      defaultValue: null,
    });

    if (!removedPart) {
      return {
        removed: false,
        reason: `${pluginName} is not reachable`,
      };
    }
    return removedPart;
  },
});

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
  partsApi,
}: {
  models: IModels;
  template: TRegisteredTemplate;
  answers: TTemplateAnswers;
  userId: string;
  nodes: Map<string, TTemplateNodeDetails>;
  partsApi: TTemplatePartsApi;
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
  // Parts first: their ids, and what came with them, go into the journeys
  const { parts } = materializeTemplate(template, {
    answers: resolved,
    partIds: {},
  });

  const withNodeDetails = <
    T extends { type: string; label: string; icon?: string },
  >(
    action: T,
  ) => ({
    ...action,
    label: action.label || nodes.get(action.type)?.label || '',
    icon: action.icon || nodes.get(action.type)?.icon,
  });

  const createdParts: TInstalledPart[] = [];
  const automationIds: Record<string, string> = {};

  try {
    for (const part of parts) {
      const created = await partsApi.create({
        type: part.type,
        doc: part.doc,
        userId,
      });

      createdParts.push({
        key: part.key,
        type: part.type,
        _id: created._id,
        refs: created.refs,
      });
    }

    const partIds = Object.fromEntries(
      createdParts.map(({ key, _id }) => [key, _id]),
    );
    const { automations } = materializeTemplate(template, {
      answers: resolved,
      partIds,
      partRefs: Object.fromEntries(
        createdParts.map(({ key, refs }) => [key, refs || {}]),
      ),
    });

    for (const { name, triggers, actions, workflows, journey } of automations) {
      const created = await models.Automations.createAutomation(
        {
          name: name,
          status: AUTOMATION_STATUSES.DRAFT,
          triggers: triggers.map((trigger) => {
            const node = nodes.get(trigger.type) || {};

            return {
              ...trigger,
              isCustom: !!node.isCustom,
              label: node.label || '',
              icon: node.icon,
              description: node.description || '',
            };
          }) as unknown as IAutomation['triggers'],
          actions: actions.map(withNodeDetails),
          workflows: workflows.map((workflow) => ({
            // The builder's own field: empty for a workflow drawn in place
            automationId: '',
            ...workflow,
            actions: workflow.actions.map(withNodeDetails),
          })),
        } as IAutomation,
        userId,
      );

      // Automation ids are ObjectIds; kept as text like every other id here
      automationIds[journey] = String(created._id);
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
      parts: createdParts,
      automationIds,
      createdBy: userId,
    });
  } catch (error) {
    await models.Automations.removeAutomations(
      Object.values(automationIds),
    ).catch(() => undefined);

    // Nothing was made with them yet, so each one goes
    for (const part of [...createdParts].reverse()) {
      await partsApi.remove(part).catch(() => undefined);
    }

    throw error;
  }
};
