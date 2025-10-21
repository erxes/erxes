import { AutomationNodesType, AutomationNodeType } from '@/automations/types';

export const CANVAS_FIT_VIEW_OPTIONS = { padding: 4, minZoom: 0.8 };

export const PROPERTY_OPERATOR = {
  String: [
    {
      value: 'set',
      label: 'Set',
    },
    {
      value: 'concat',
      label: 'Concat',
    },
  ],
  Date: [
    {
      value: 'set',
      label: 'Set',
    },
    {
      value: 'addDay',
      label: 'Add Day',
    },
    {
      value: 'subtractDay',
      label: 'Subtract Day',
    },
  ],
  Number: [
    {
      value: 'add',
      label: 'Add',
    },
    {
      value: 'subtract',
      label: 'subtract',
    },
    {
      value: 'multiply',
      label: 'Multiply',
    },
    {
      value: 'divide',
      label: 'Divide',
    },
    {
      value: 'set',
      label: 'Set',
    },
  ],
  Default: [
    {
      value: 'set',
      label: 'Set',
    },
  ],
};

export const STATUSES_BADGE_VARIABLES = {
  active: 'default',
  waiting: 'secondary',
  error: 'destructive',
  missed: 'warning',
  complete: 'success',
} as const;

export const AUTOMATION_HISTORIES_CURSOR_SESSION_KEY =
  'automation-histories-cursor';

export const AUTOMATION_LIBRARY_TABS = [
  { value: AutomationNodeType.Trigger, label: 'Triggers' },
  { value: AutomationNodeType.Action, label: 'Actions' },
  { value: AutomationNodeType.Workflow, label: 'Automations' },
];
type ConnectionPropertyName = 'nextActionId' | 'actionId' | 'workflowId';

export const CONNECTION_PROPERTY_NAME_MAP: Record<
  AutomationNodeType,
  ConnectionPropertyName
> = {
  [AutomationNodeType.Action]: 'nextActionId',
  [AutomationNodeType.Trigger]: 'actionId',
  [AutomationNodeType.Workflow]: 'workflowId',
};

export const AUTOMATION_NODE_TYPE_LIST_PROERTY = {
  [AutomationNodeType.Action]: AutomationNodesType.Actions,
  [AutomationNodeType.Trigger]: AutomationNodesType.Triggers,
  [AutomationNodeType.Workflow]: AutomationNodesType.Workflows,
};
