import type { ActionGroup, ConsentScope, ScopeLeaf } from '../types';

const ACTION_TITLES: Record<string, string> = {
  read: 'Read',
  'create-update': 'Create and update',
  create: 'Create',
  update: 'Update',
  remove: 'Remove',
  merge: 'Merge',
  manage: 'Manage',
};

const ACTION_ORDER = ['read', 'create-update', 'remove', 'merge', 'manage'];

const getActionGroupKey = (action: string) => {
  if (action === 'create' || action === 'update') {
    return 'create-update';
  }

  if (action === 'delete' || action === 'remove') {
    return 'remove';
  }

  return action;
};

export const formatLabel = (value: string) => {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .trim();

  if (!normalized) {
    return 'Access';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getActionTitle = (action: string) => {
  return ACTION_TITLES[action] || formatLabel(action);
};

export const buildActionGroups = (scopes: ConsentScope[]): ActionGroup[] => {
  const grouped = new Map<string, Map<string, ScopeLeaf[]>>();

  for (const scopeItem of scopes) {
    const [module = 'general', action = 'access'] = scopeItem.scope.split(':');
    const actionGroup = getActionGroupKey(action);
    const actionModules =
      grouped.get(actionGroup) || new Map<string, ScopeLeaf[]>();
    const moduleScopes = actionModules.get(module) || [];

    moduleScopes.push({ ...scopeItem, module, action });
    actionModules.set(module, moduleScopes);
    grouped.set(actionGroup, actionModules);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => {
      const leftIndex = ACTION_ORDER.indexOf(left);
      const rightIndex = ACTION_ORDER.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;

      return leftIndex - rightIndex;
    })
    .map(([action, modules]) => ({
      action,
      title: getActionTitle(action),
      modules: [...modules.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([module, moduleScopes]) => ({
          module,
          scopes: [...moduleScopes].sort((left, right) =>
            left.scope.localeCompare(right.scope),
          ),
        })),
    }));
};
