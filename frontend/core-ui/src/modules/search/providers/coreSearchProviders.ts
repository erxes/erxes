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
  createdAt?: string | null;
  matchFields?: Array<{ label: string; value: string }> | null;
};

const CORE_RESULT_PATHS: Record<string, (id: string) => string> = {
  'contacts-customer': (id) => `/contacts/customers?contactId=${id}`,
  'contacts-company': (id) => `/contacts/companies?companyId=${id}`,
  'products-product': (id) => `/products?product_id=${id}`,
  'settings-team-member': (id) => `/settings/team/members?user_id=${id}`,
  'settings-branch': (id) => `/settings/structures/branches?branch_id=${id}`,
  'settings-department': (id) =>
    `/settings/structures/departments?department_id=${id}`,
  'settings-unit': (id) => `/settings/structures/units?unit_id=${id}`,
  'settings-position': (id) =>
    `/settings/structures/positions?position_id=${id}`,
  'settings-brand': (id) => `/settings/brands?brand_id=${id}`,
};

const getCoreResultPath = (node: TCategorySearchNode) => {
  const pathFactory = node.module ? CORE_RESULT_PATHS[node.module] : undefined;

  return pathFactory ? pathFactory(encodeURIComponent(node.id)) : node.path;
};

const toItem = (node: TCategorySearchNode) => {
  return {
    id: node.id,
    title: node.title,
    description: node.description ?? undefined,
    createdAt: node.createdAt ?? undefined,
    path: getCoreResultPath(node),
    matchFields: node.matchFields ?? undefined,
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
        body: '{ list { id title description path module createdAt matchFields } totalCount pageInfo { hasNextPage endCursor } }',
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
        body: '{ list { id title description path module createdAt matchFields } totalCount pageInfo { hasNextPage endCursor } }',
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
