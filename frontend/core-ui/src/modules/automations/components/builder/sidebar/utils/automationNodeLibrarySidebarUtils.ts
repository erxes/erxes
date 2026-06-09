import {
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

const CORE_ACTION_GROUPS = [
  'Logic & Decisions',
  'Communication & Integrations',
  'Data Operations',
  'Timing & Delays',
];

export const TRIGGER_GROUPS = ['Event based', 'Record based'];

const titleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

const getActionGroup = (action: IAutomationsActionConfigConstants) => {
  if (action.group) {
    return action.group;
  }

  const [pluginName] = action.type.split(':');
  return pluginName && pluginName !== action.type ? titleCase(pluginName) : '';
};

export const getActionGroupBadges = (
  actions: IAutomationsActionConfigConstants[],
) => {
  const actionGroups = actions.map(getActionGroup).filter(Boolean);
  const pluginGroups = actionGroups.filter(
    (group) => !CORE_ACTION_GROUPS.includes(group),
  );

  return [
    ...CORE_ACTION_GROUPS.filter((group) => actionGroups.includes(group)),
    ...Array.from(new Set(pluginGroups)),
  ];
};

export const groupActionsByType = ({
  actions,
  groups,
  activeGroup,
}: {
  actions: IAutomationsActionConfigConstants[];
  groups: string[];
  activeGroup: string | null;
}) => {
  const visibleGroups = activeGroup ? [activeGroup] : groups;

  return visibleGroups
    .map((group) => ({
      name: group,
      list: actions.filter((action) => getActionGroup(action) === group),
    }))
    .filter((group) => group.list.length);
};

export const groupTriggersByCustomType = ({
  triggers,
  activeGroup,
}: {
  triggers: IAutomationsTriggerConfigConstants[];
  activeGroup?: string | null;
}) => {
  const groups = [
    {
      name: TRIGGER_GROUPS[0],
      list: triggers.filter((trigger) => trigger.isCustom),
    },
    {
      name: TRIGGER_GROUPS[1],
      list: triggers.filter((trigger) => !trigger.isCustom),
    },
  ];

  return groups
    .filter((group) => !activeGroup || group.name === activeGroup)
    .filter((group) => group.list.length);
};
