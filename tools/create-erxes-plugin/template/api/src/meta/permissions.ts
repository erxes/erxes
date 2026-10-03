import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'changeme',
  modules: [
    {
      name: 'changemodule',
      description: 'Changemodule management',
      scopeField: null,
      ownerFields: [],
      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],
      actions: [
        {
          title: 'View changemodule items',
          name: 'changemecChangemoduleItemsShow',
          description: 'View changemodule items',
          always: true,
        },
        {
          title: 'Manage changemodule items',
          name: 'changemecChangemoduleItemsManage',
          description: 'Create, edit and remove changemodule items',
        },
      ],
    },
  ],
};
