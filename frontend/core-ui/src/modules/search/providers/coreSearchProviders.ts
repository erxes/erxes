import { IconLayoutDashboard, IconSettings } from '@tabler/icons-react';
import { defineSearchProvider, ISearchProvider, readCursorList } from 'erxes-ui';

type TCategorySearchNode = {
  id: string;
  title: string;
  description?: string | null;
  path: string;
  module?: string | null;
};

const MODULE_LABELS: Record<string, string> = {
  'contacts-customer': 'Customer',
  'contacts-company': 'Company',
  'products-product': 'Product',
  'settings-team-member': 'Team member',
  'settings-branch': 'Branch',
  'settings-department': 'Department',
  'settings-unit': 'Unit',
  'settings-position': 'Position',
  'settings-brand': 'Brand',
};

const toItem = (node: TCategorySearchNode) => {
  const label = node.module ? MODULE_LABELS[node.module] : undefined;

  return {
    id: node.id,
    title: node.title,
    description: label
      ? `${label}: ${node.description ?? ''}`.trim()
      : (node.description ?? undefined),
    path: node.path,
  };
};

export const coreModulesSearchProvider =
  defineSearchProvider<TCategorySearchNode>({
    key: 'core-modules',
    label: 'Core modules',
    labelKey: 'core-modules',
    icon: IconLayoutDashboard,
    order: 10,
    selections: [
      {
        alias: 'gs_core_modules',
        field: 'coreModulesGlobalSearch',
        args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor',
        body: '{ list { id title description path module } totalCount pageInfo { hasNextPage endCursor } }',
      },
    ],
    select: (payload) =>
      readCursorList<TCategorySearchNode>(payload, 'gs_core_modules'),
    toItem,
  });

export const settingsSearchProvider = defineSearchProvider<TCategorySearchNode>({
  key: 'settings',
  label: 'Settings',
  labelKey: 'settings',
  icon: IconSettings,
  order: 20,
selections: [
      {
        alias: 'gs_settings_core',
        field: 'settingsGlobalSearch',
        args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor',
        body: '{ list { id title description path module } totalCount pageInfo { hasNextPage endCursor } }',
      },
    ],
    select: (payload) =>
      readCursorList<TCategorySearchNode>(payload, 'gs_settings_core'),
  toItem,
});

export const CORE_SEARCH_PROVIDERS: ISearchProvider[] = [
  coreModulesSearchProvider,
  settingsSearchProvider,
];
