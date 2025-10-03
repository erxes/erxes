import {
  IconDatabaseEdit,
  IconDatabaseMinus,
  IconDatabasePlus,
  IconDna,
  IconHttpDelete,
  IconHttpGet,
  IconHttpPatch,
  IconHttpPost,
  IconHttpPut,
  IconLogin,
  IconLogout,
} from '@tabler/icons-react';

export const LOGS_SOURCE_ACTIONS = {
  mongo: [
    {
      value: 'create',
      label: 'Created',
      icon: IconDatabasePlus,
    },
    {
      value: 'update',
      label: 'Updated',
      icon: IconDatabaseEdit,
    },
    {
      value: 'remove',
      label: 'Removed',
      icon: IconDatabaseMinus,
    },
  ],
  graphql: [
    {
      value: 'mutations',
      label: 'Mutations',
      icon: IconDna,
    },
  ],
  webhook: [
    {
      value: 'GET',
      label: 'GET',
      icon: IconHttpGet,
    },
    {
      value: 'POST',
      label: 'POST',
      icon: IconHttpPost,
    },
    {
      value: 'PUT',
      label: 'PUT',
      icon: IconHttpPut,
    },
    {
      value: 'PATCH',
      label: 'PATCH',
      icon: IconHttpPatch,
    },
    {
      value: 'DELETE',
      label: 'DELETE',
      icon: IconHttpDelete,
    },
  ],
  auth: [
    {
      value: 'login',
      label: 'Login',
      icon: IconLogin,
    },
    {
      value: 'logout',
      label: 'Logout',
      icon: IconLogout,
    },
  ],
};

export const LOGS_CURSOR_SESSION_KEY = 'logs-cursor';

export const COMMON_FILTER_BAR_OPERATORS = [
  { value: 'eq', label: 'Equals to' },
  { value: 'ne', label: 'Not Equals' },
];

export const LOG_FILTER_BAR_OPERATORS = {
  status: [...COMMON_FILTER_BAR_OPERATORS],
  source: [...COMMON_FILTER_BAR_OPERATORS],
  action: [...COMMON_FILTER_BAR_OPERATORS],
  userIds: [...COMMON_FILTER_BAR_OPERATORS],
  createdAt: [...COMMON_FILTER_BAR_OPERATORS],
};

export const LOGS_COMMON_FILTER_FIELD_NAMES = [
  'status',
  'source',
  'action',
  'userIds',
  'createdAt',
  'statusOperator',
  'sourceOperator',
  'actionOperator',
  'userIdsOperator',
  'createdAtOperator',
  'logId',
];
