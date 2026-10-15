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
      labelKey: 'action-created',
      icon: IconDatabasePlus,
    },
    {
      value: 'update',
      labelKey: 'action-updated',
      icon: IconDatabaseEdit,
    },
    {
      value: 'remove',
      labelKey: 'action-removed',
      icon: IconDatabaseMinus,
    },
  ],
  graphql: [
    {
      value: 'mutations',
      labelKey: 'action-mutations',
      icon: IconDna,
    },
  ],
  webhook: [
    {
      value: 'GET',
      labelKey: 'action-get',
      icon: IconHttpGet,
    },
    {
      value: 'POST',
      labelKey: 'action-post',
      icon: IconHttpPost,
    },
    {
      value: 'PUT',
      labelKey: 'action-put',
      icon: IconHttpPut,
    },
    {
      value: 'PATCH',
      labelKey: 'action-patch',
      icon: IconHttpPatch,
    },
    {
      value: 'DELETE',
      labelKey: 'action-delete',
      icon: IconHttpDelete,
    },
  ],
  auth: [
    {
      value: 'login',
      labelKey: 'action-login',
      icon: IconLogin,
    },
    {
      value: 'logout',
      labelKey: 'action-logout',
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
  contentType: [...COMMON_FILTER_BAR_OPERATORS],
  docId: [...COMMON_FILTER_BAR_OPERATORS],
};

export const LOGS_COMMON_FILTER_FIELD_NAMES = [
  'status',
  'source',
  'action',
  'userIds',
  'createdAt',
  'contentType',
  'docId',
  'statusOperator',
  'sourceOperator',
  'actionOperator',
  'userIdsOperator',
  'createdAtOperator',
  'contentTypeOperator',
  'docIdOperator',
  'logId',
];

export const formatLogContentTypeSegmentLabel = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const formatLogContentTypeLabel = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const [pluginName = '', contentType = ''] = value.split(':');
  const [moduleName = '', collectionName = ''] = contentType.split('.');

  const label = [pluginName, moduleName, collectionName]
    .map((segment) => formatLogContentTypeSegmentLabel(segment))
    .filter(Boolean)
    .join(' / ');

  return label || value;
};
