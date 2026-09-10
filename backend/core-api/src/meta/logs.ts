import { LogsConfigs } from 'erxes-api-shared/core-modules';

export const logs: LogsConfigs = {
  contentTypes: [
    {
      moduleName: 'contacts',
      collectionName: 'customers',
    },
    {
      moduleName: 'contacts',
      collectionName: 'companies',
    },
    {
      moduleName: 'organization',
      collectionName: 'users',
    },
    {
      moduleName: 'organization',
      collectionName: 'brands',
    },
    {
      moduleName: 'organization',
      collectionName: 'configs',
    },
    {
      moduleName: 'tags',
      collectionName: 'tags',
    },
    {
      moduleName: 'internalNote',
      collectionName: 'internal_notes',
    },
    {
      moduleName: 'products',
      collectionName: 'products',
    },
    {
      moduleName: 'products',
      collectionName: 'uoms',
    },
    {
      moduleName: 'products',
      collectionName: 'products_configs',
    },
    {
      moduleName: 'products',
      collectionName: 'product_categories',
    },
    {
      moduleName: 'app_tokens',
      collectionName: 'app_tokens',
    },
  ],
};
