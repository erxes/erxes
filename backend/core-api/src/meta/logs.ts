import { LogsConfigs } from 'erxes-api-shared/core-modules';

// `permission` names the action that gates point-in-time revert of the entity
// (admin/owner bypasses) — the destructive REMOVE/manage action for that
// collection. `mongooseName` is the model name the raw revert applier resolves
// via connection.model(mongooseName); it matches the names registered in
// connectionResolvers.ts. Entities without a `permission` are revertible by
// owners/admins only (fail-closed).
export const logs: LogsConfigs = {
  contentTypes: [
    {
      moduleName: 'contacts',
      collectionName: 'customers',
      permission: 'contactsDelete',
      mongooseName: 'customers',
    },
    {
      moduleName: 'contacts',
      collectionName: 'companies',
      permission: 'contactsDelete',
      mongooseName: 'companies',
    },
    {
      moduleName: 'organization',
      collectionName: 'users',
      permission: 'teamMembersRemove',
      mongooseName: 'users',
    },
    {
      moduleName: 'organization',
      collectionName: 'brands',
      permission: 'brandsDelete',
      mongooseName: 'brands',
    },
    {
      moduleName: 'organization',
      collectionName: 'configs',
      mongooseName: 'configs',
    },
    {
      moduleName: 'tags',
      collectionName: 'tags',
      permission: 'tagsDelete',
      mongooseName: 'tags',
    },
    {
      moduleName: 'internalNote',
      collectionName: 'internal_notes',
      permission: 'internalNotesManage',
      mongooseName: 'internal_notes',
    },
    {
      moduleName: 'products',
      collectionName: 'products',
      permission: 'productsDelete',
      mongooseName: 'products',
    },
    {
      moduleName: 'products',
      collectionName: 'uoms',
      permission: 'uomsManage',
      mongooseName: 'uoms',
    },
    {
      moduleName: 'products',
      collectionName: 'products_configs',
      permission: 'productsConfigsManage',
      mongooseName: 'products_configs',
    },
    {
      moduleName: 'products',
      collectionName: 'product_categories',
      permission: 'productCategoriesManage',
      mongooseName: 'product_categories',
    },
    {
      moduleName: 'app_tokens',
      collectionName: 'app_tokens',
      permission: 'appsManage',
      mongooseName: 'app_tokens',
    },
  ],
};
