import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'core',

  modules: [
    {
      name: 'contacts',
      description: 'Contact management',
      scopeField: null,
      ownerFields: ['createdBy', 'ownerId'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created or owned',
        },

        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View contacts records',
          name: 'contactsRead',
          description: 'View contacts',
          always: true,
        },
        {
          title: 'Create contacts records',
          name: 'contactsCreate',
          description: 'Create contacts',
        },
        {
          title: 'Edit contacts records',
          name: 'contactsUpdate',
          description: 'Edit contacts',
        },
        {
          title: 'Delete contacts records',
          name: 'contactsDelete',
          description: 'Delete contacts',
        },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'core:admin',
      name: 'Core modules admin',
      description: 'Full access to Core modules',
      permissions: [
        {
          plugin: 'core',
          module: 'contacts',
          actions: [
            'contactsRead',
            'contactsCreate',
            'contactsUpdate',
            'contactsDelete',
          ],
          scope: 'all',
        },
      ],
    },
  ],
};
