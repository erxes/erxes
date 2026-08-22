import { IconLayoutDashboard, IconSettings } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readCursorList,
} from 'erxes-ui';

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
      : node.description ?? undefined,
    path: node.path,
  };
};

const createCoreModulesSearchProvider = (
  key: string,
  label: string,
  module: 'contacts' | 'products',
  order: number,
) =>
  defineSearchProvider<TCategorySearchNode>({
    key,
    label,
    icon: IconLayoutDashboard,
    order,
    selections: [
      {
        alias: `gs_core_${module}`,
        field: 'coreModulesGlobalSearch',
        args: `searchValue: $searchValue, module: "${module}", limit: $limit, cursor: $cursor, orderBy: $orderBy`,
        body: '{ list { id title description path module } totalCount pageInfo { hasNextPage endCursor } }',
      },
    ],
    select: (payload) =>
      readCursorList<TCategorySearchNode>(payload, `gs_core_${module}`),
    toItem,
  });

export const contactsSearchProvider = createCoreModulesSearchProvider(
  'core-contacts',
  'Contacts',
  'contacts',
  10,
);

export const productsSearchProvider = createCoreModulesSearchProvider(
  'core-products',
  'Products',
  'products',
  11,
);

export const settingsSearchProvider = defineSearchProvider<TCategorySearchNode>(
  {
    key: 'settings',
    label: 'Settings',
    labelKey: 'settings',
    icon: IconSettings,
    order: 20,
    selections: [
      {
        alias: 'gs_settings_core',
        field: 'settingsGlobalSearch',
        args: 'searchValue: $searchValue, limit: $limit, cursor: $cursor, orderBy: $orderBy',
        body: '{ list { id title description path module } totalCount pageInfo { hasNextPage endCursor } }',
      },
    ],
    select: (payload) =>
      readCursorList<TCategorySearchNode>(payload, 'gs_settings_core'),
    toItem,
  },
);

export const CORE_SEARCH_PROVIDERS: ISearchProvider[] = [
  contactsSearchProvider,
  productsSearchProvider,
  settingsSearchProvider,
];
