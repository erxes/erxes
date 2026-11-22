import { ActionField, type ActionInfo } from '@erxes/core-contract';
import { type Connections, INTEGRATION_ACTIONS } from '~/modules/integrations/actions';
import { AGENT_ACTIONS } from './agent';
import { AUTOMATION_ACTIONS } from './automations';
import type { CoreAction } from './context';
import { LEAD_ACTIONS } from './leads';
import { MESSAGE_ACTIONS } from './messages';
import type { ActionPlugin } from './plugin';
import { RECORD_ACTIONS } from './records';
import { REPLY_ACTIONS } from './reply';

const CORE_ACTIONS: CoreAction[] = [
  ...RECORD_ACTIONS,
  ...MESSAGE_ACTIONS,
  ...LEAD_ACTIONS,
  ...AGENT_ACTIONS,
  ...AUTOMATION_ACTIONS,
  ...REPLY_ACTIONS,
  ...INTEGRATION_ACTIONS,
];

/** Core's action of this type, its integrations' included. */
export const coreAction = (type: string) => CORE_ACTIONS.find((action) => action.type === type);

const coreInfo = (action: CoreAction, connections: Connections): ActionInfo => {
  const choices = action.integration ? (connections.get(action.integration.key) ?? []) : [];

  return {
    type: action.type,
    label: action.label,
    description: action.description,
    source: 'core',
    integration: action.integration?.key ?? null,
    integrationName: action.integration?.name ?? null,
    subject: action.subject,
    fields: action.fields.map((field) =>
      field.type === 'connection' ? { ...field, options: choices } : field,
    ),
    outputs: action.outputs ?? [],
  };
};

const pluginInfos = (plugin: ActionPlugin): ActionInfo[] => {
  const integrations = plugin.manifest?.integrations ?? [];

  return (plugin.manifest?.actions ?? []).map((action) => ({
    type: action.type,
    label: action.label,
    description: action.description ?? null,
    source: plugin.name,
    integration: action.integration ? `${plugin.name}.${action.integration}` : null,
    integrationName:
      integrations.find((integration) => integration.key === action.integration)?.name ?? null,
    subject: action.subject ?? null,
    // Checked against the contract when the plugin registered.
    fields: action.fields.map((field) => ActionField.parse(field)),
    outputs: action.outputs ?? [],
  }));
};

/**
 * Core's actions, those of its integrations connected here (`connections`, with each one's
 * active connections), and those of the installed plugins (from their manifests).
 */
export const actionCatalog = (
  installed: ActionPlugin[],
  connections: Connections,
): ActionInfo[] => [
  ...CORE_ACTIONS.filter(
    (action) => !action.integration || connections.has(action.integration.key),
  ).map((action) => coreInfo(action, connections)),
  ...installed.flatMap(pluginInfos),
];
