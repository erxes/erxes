import { ActionField, type ActionInfo } from '@erxes/core-contract';
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
];

export const coreAction = (type: string) => CORE_ACTIONS.find((action) => action.type === type);

/** Core's actions and those of the installed plugins (from their manifests). */
export const actionCatalog = (installed: ActionPlugin[]): ActionInfo[] => [
  ...CORE_ACTIONS.map((action) => ({
    type: action.type,
    label: action.label,
    description: action.description,
    subject: action.subject,
    fields: action.fields,
    outputs: action.outputs ?? [],
    source: 'core',
  })),
  ...installed.flatMap((plugin) =>
    (plugin.manifest?.actions ?? []).map((action) => ({
      type: action.type,
      label: action.label,
      description: action.description ?? null,
      source: plugin.name,
      subject: action.subject ?? null,
      // Checked against the contract when the plugin registered.
      fields: action.fields.map((field) => ActionField.parse(field)),
      outputs: action.outputs ?? [],
    })),
  ),
];
