import { splitType, TTemplate } from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { getAutomationConstants } from '@/automations/graphql/resolvers/utils/queriesUtils';
import { CORE_TEMPLATES } from '@/template/builtIn';

export type TRegisteredTemplate = TTemplate & { pluginName: string };

// Requirement kinds core answers itself, whatever plugins are enabled
const CORE_KIND_OWNERS = new Set(['core', 'automations']);

/**
 * A template can only install what this deployment has: every trigger and
 * step type must be one automations knows, and every requirement and part
 * must have an enabled owner to answer or create it.
 */
export const isTemplateAvailable = (
  template: TTemplate,
  { nodeTypes, plugins }: { nodeTypes: Set<string>; plugins: Set<string> },
) =>
  template.journeys.every(
    ({ trigger, flow }) =>
      nodeTypes.has(trigger.type) &&
      flow.every(({ type }) => nodeTypes.has(type)),
  ) &&
  [
    ...template.requirements.map(({ kind }) => kind),
    ...template.parts.map(({ type }) => type),
  ].every((kindOrType) => {
    const [owner] = splitType(kindOrType);

    return CORE_KIND_OWNERS.has(owner) || plugins.has(owner);
  });

/** What a saved node carries besides its config, as its declaration says. */
export type TTemplateNodeDetails = {
  isCustom?: boolean;
  label?: string;
  icon?: string;
  description?: string;
};

/**
 * Node details by type. A trigger saved without `isCustom` is run as a
 * segment trigger and drawn as one, so installing copies it from here.
 */
export const getTemplateNodeDetails = async () => {
  const { triggersConst, actionsConst } = await getAutomationConstants();
  const details = new Map<string, TTemplateNodeDetails>();

  for (const { type, isCustom, label, icon, description } of [
    ...triggersConst,
    ...actionsConst,
  ] as (TTemplateNodeDetails & { type?: string })[]) {
    if (type) {
      details.set(type, { isCustom, label, icon, description });
    }
  }

  return details;
};

/** Every template core and enabled plugins declare, available ones only. */
export const getAvailableTemplates = async (): Promise<
  TRegisteredTemplate[]
> => {
  const pluginNames = (await getPlugins()).filter((name) => name !== 'core');
  const constants = await getAutomationConstants();
  const nodeTypes = new Set(
    [...constants.triggersConst, ...constants.actionsConst]
      .map(({ type }) => type)
      .filter((type): type is string => !!type),
  );
  const plugins = new Set(pluginNames);
  const templates: TRegisteredTemplate[] = CORE_TEMPLATES.filter((template) =>
    isTemplateAvailable(template, { nodeTypes, plugins }),
  ).map((template) => ({ ...template, pluginName: 'core' }));

  for (const pluginName of pluginNames) {
    const plugin = await getPlugin(pluginName);
    const declared = (plugin.config?.meta?.templates || []) as TTemplate[];

    for (const template of declared) {
      if (isTemplateAvailable(template, { nodeTypes, plugins })) {
        templates.push({ ...template, pluginName });
      }
    }
  }

  return templates;
};

export const findAvailableTemplate = async (
  pluginName: string,
  templateId: string,
) => {
  const template = (await getAvailableTemplates()).find(
    (item) => item.pluginName === pluginName && item.id === templateId,
  );

  if (!template) {
    throw new Error('This template is not available');
  }

  return template;
};
