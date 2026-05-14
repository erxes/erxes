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
          oauthScope: 'contacts:read',
          always: true,
        },
        {
          title: 'Create contacts records',
          name: 'contactsCreate',
          description: 'Create contacts',
          oauthScope: 'contacts:create',
        },
        {
          title: 'Edit contacts records',
          name: 'contactsUpdate',
          description: 'Edit contacts',
          oauthScope: 'contacts:update',
        },
        {
          title: 'Delete contacts records',
          name: 'contactsDelete',
          description: 'Delete contacts',
          oauthScope: 'contacts:remove',
        },
        {
          title: 'Merge contacts records',
          name: 'contactsMerge',
          description: 'Merge contacts',
          oauthScope: 'contacts:merge',
        },
      ],
    },
    {
      name: 'products',
      description: 'Product management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View products',
          name: 'productsRead',
          description: 'View products',
          oauthScope: 'products:read',
          always: true,
        },
        {
          title: 'Create products',
          name: 'productsCreate',
          description: 'Create products',
          oauthScope: 'products:create',
        },
        {
          title: 'Edit products',
          name: 'productsUpdate',
          description: 'Edit products',
          oauthScope: 'products:update',
        },
        {
          title: 'Delete products',
          name: 'productsDelete',
          description: 'Delete products',
          oauthScope: 'products:remove',
        },
        {
          title: 'Merge products',
          name: 'productsMerge',
          description: 'Merge products',
          oauthScope: 'products:merge',
        },
        {
          title: 'Manage product categories',
          name: 'productCategoriesManage',
          description: 'Create, edit, delete product categories',
          oauthScope: 'products:manage',
        },
        {
          title: 'Manage product configurations',
          name: 'productsConfigsManage',
          description: 'Update product configurations',
          oauthScope: 'products:manage',
        },
        {
          title: 'Manage units of measure',
          name: 'uomsManage',
          description: 'Create, edit, delete units of measure',
          oauthScope: 'products:manage',
        },
        {
          title: 'Manage product rules',
          name: 'productRulesManage',
          description: 'Create, edit, delete product rules',
          oauthScope: 'products:manage',
        },
      ],
    },
    {
      name: 'properties',
      description: 'Custom fields and field groups',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View properties',
          name: 'propertiesRead',
          description: 'View custom fields',
          always: true,
        },
        {
          title: 'Manage fields',
          name: 'fieldsManage',
          description: 'Create, edit, delete custom fields',
        },
        {
          title: 'Manage field groups',
          name: 'fieldGroupsManage',
          description: 'Create, edit, delete field groups',
        },
      ],
    },
    {
      name: 'tags',
      description: 'Tag management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View tags',
          name: 'tagsRead',
          description: 'View tags',
          oauthScope: 'tags:read',
          always: true,
        },
        {
          title: 'Create tags',
          name: 'tagsCreate',
          description: 'Create tags',
          oauthScope: 'tags:create',
        },
        {
          title: 'Edit tags',
          name: 'tagsUpdate',
          description: 'Edit tags',
          oauthScope: 'tags:update',
        },
        {
          title: 'Delete tags',
          name: 'tagsDelete',
          description: 'Delete tags',
          oauthScope: 'tags:remove',
        },
        {
          title: 'Tag items',
          name: 'tagsTag',
          description: 'Attach tags to items',
          oauthScope: 'tags:tag',
        },
      ],
    },
    {
      name: 'segments',
      description: 'Segment management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View segments',
          name: 'segmentsRead',
          description: 'View segments',
          always: true,
        },
        {
          title: 'Manage segments',
          name: 'segmentsManage',
          description: 'Create, edit, delete segments',
        },
      ],
    },
    {
      name: 'documents',
      description: 'Document management',
      scopeField: null,
      ownerFields: ['createdUserId'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View documents',
          name: 'documentsRead',
          description: 'View documents',
          oauthScope: 'documents:read',
          always: true,
        },
        {
          title: 'Manage documents',
          name: 'manageDocuments',
          description: 'Create and edit documents',
          oauthScopes: ['documents:create', 'documents:update'],
        },
        {
          title: 'Remove documents',
          name: 'removeDocuments',
          description: 'Delete documents',
          oauthScope: 'documents:remove',
        },
      ],
    },
    {
      name: 'brands',
      description: 'Brand management',
      scopeField: null,
      ownerFields: ['userId'],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View brands',
          name: 'brandsRead',
          description: 'View brands',
          oauthScope: 'brands:read',
          always: true,
        },
        {
          title: 'Create brands',
          name: 'brandsCreate',
          description: 'Create brands',
          oauthScope: 'brands:create',
        },
        {
          title: 'Edit brands',
          name: 'brandsUpdate',
          description: 'Edit brands',
          oauthScope: 'brands:update',
        },
        {
          title: 'Delete brands',
          name: 'brandsDelete',
          description: 'Delete brands',
          oauthScope: 'brands:remove',
        },
      ],
    },
    {
      name: 'organization',
      description: 'Organization structure management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View organization structure',
          name: 'organizationRead',
          description:
            'View structures, departments, branches, units, positions',
          oauthScope: 'organization:read',
          always: true,
        },
        {
          title: 'Manage structures',
          name: 'structuresManage',
          description: 'Create, edit, delete structures',
          oauthScope: 'organization:manage',
        },
        {
          title: 'Manage departments',
          name: 'departmentsManage',
          description: 'Create, edit, delete departments',
          oauthScope: 'organization:manage',
        },
        {
          title: 'Manage branches',
          name: 'branchesManage',
          description: 'Create, edit, delete branches',
          oauthScope: 'organization:manage',
        },
        {
          title: 'Manage units',
          name: 'unitsManage',
          description: 'Create, edit, delete units',
          oauthScope: 'organization:manage',
        },
        {
          title: 'Manage positions',
          name: 'positionsManage',
          description: 'Create, edit, delete positions',
          oauthScope: 'organization:manage',
        },
      ],
    },
    {
      name: 'teamMembers',
      description: 'Team member management',
      scopeField: null,
      ownerFields: [],

      scopes: [
        {
          name: 'own',
          description: 'Own record only',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View team members',
          name: 'teamMembersRead',
          description: 'View team members',
          oauthScope: 'teamMembers:read',
          always: true,
        },
        {
          title: 'Invite team members',
          name: 'teamMembersInvite',
          description: 'Invite users to team',
          oauthScope: 'teamMembers:create',
        },
        {
          title: 'Edit team members',
          name: 'teamMembersUpdate',
          description: 'Edit team member details',
          oauthScope: 'teamMembers:update',
        },
        {
          title: 'Remove team members',
          name: 'teamMembersRemove',
          description: 'Deactivate team members',
          oauthScope: 'teamMembers:remove',
        },
        {
          title: 'Reset member password',
          name: 'teamMembersResetPassword',
          description: 'Reset team member password',
        },
      ],
    },
    {
      name: 'broadcasts',
      description: 'Broadcast & engage message management',
      scopeField: null,
      ownerFields: ['createdBy'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View broadcasts',
          name: 'broadcastRead',
          description: 'View engage messages',
          always: true,
        },
        {
          title: 'Create broadcasts',
          name: 'broadcastCreate',
          description: 'Create engage messages',
        },
        {
          title: 'Edit broadcasts',
          name: 'broadcastUpdate',
          description: 'Edit engage messages',
        },
        {
          title: 'Delete broadcasts',
          name: 'broadcastDelete',
          description: 'Delete engage messages',
        },
        {
          title: 'Manage broadcast configs',
          name: 'broadcastConfigsManage',
          description: 'Update broadcast configurations',
        },
      ],
    },
    {
      name: 'importExport',
      description: 'Import and export management',
      scopeField: null,
      ownerFields: ['userId'],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'Manage imports',
          name: 'importsManage',
          description: 'Start, cancel, retry, and resume imports',
        },
        {
          title: 'Manage exports',
          name: 'exportsManage',
          description: 'Start, cancel, and retry exports',
        },
      ],
    },
    {
      name: 'bundle',
      description: 'Bundle management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View bundles',
          name: 'bundleRead',
          description: 'View bundle rules and conditions',
          always: true,
        },
        {
          title: 'Manage bundle rules',
          name: 'bundleRulesManage',
          description: 'Create, edit, delete bundle rules',
        },
        {
          title: 'Manage bundle conditions',
          name: 'bundleConditionsManage',
          description: 'Create, edit, delete bundle conditions',
        },
      ],
    },
    {
      name: 'exchangeRates',
      description: 'Exchange rate management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View exchange rates',
          name: 'exchangeRatesRead',
          description: 'View exchange rates',
          always: true,
        },
        {
          title: 'Manage exchange rates',
          name: 'exchangeRatesManage',
          description: 'Create, edit, delete exchange rates',
        },
      ],
    },
    {
      name: 'permissions',
      description: 'Permission management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View permissions',
          name: 'permissionsRead',
          description: 'View permission groups',
          always: true,
        },
        {
          title: 'Manage permissions',
          name: 'permissionsManage',
          description:
            'Create, edit, delete permission groups and assign permissions',
        },
      ],
    },
    {
      name: 'apps',
      description: 'App management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View apps',
          name: 'appsRead',
          description: 'View apps',
          always: true,
        },
        {
          title: 'Manage apps',
          name: 'appsManage',
          description: 'Create, edit, revoke, delete apps',
        },
      ],
    },
    {
      name: 'clientPortal',
      description: 'Client portal management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View client portal',
          name: 'clientPortalRead',
          description: 'View client portal settings',
          always: true,
        },
        {
          title: 'Manage client portal',
          name: 'clientPortalManage',
          description: 'Create, edit, delete client portals',
        },
      ],
    },
    {
      name: 'automations',
      description: 'Automation management',
      scopeField: null,
      ownerFields: ['createdBy'],

      scopes: [
        {
          name: 'own',
          description: 'Records user created',
        },
        { name: 'all', description: 'All records' },
      ],

      actions: [
        {
          title: 'View automations',
          name: 'automationsRead',
          description: 'View automations',
          oauthScopes: ['automations:read', 'automations:manage'],
          always: true,
        },
        {
          title: 'Create automations',
          name: 'automationsCreate',
          description: 'Create automations',
          oauthScopes: ['automations:create', 'automations:manage'],
        },
        {
          title: 'Edit automations',
          name: 'automationsUpdate',
          description: 'Edit automations',
          oauthScopes: ['automations:update', 'automations:manage'],
        },
        {
          title: 'Delete automations',
          name: 'automationsDelete',
          description: 'Delete automations',
          oauthScopes: ['automations:delete', 'automations:manage'],
        },
      ],
    },
    {
      name: 'logs',
      description: 'System log access',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'View system logs',
          name: 'logsRead',
          description: 'View system logs',
        },
      ],
    },
    {
      name: 'internalNotes',
      description: 'Internal note management',
      scopeField: null,
      ownerFields: [],

      scopes: [{ name: 'all', description: 'All records' }],

      actions: [
        {
          title: 'Manage internal notes',
          name: 'internalNotesManage',
          description: 'Create, edit, delete internal notes',
          always: true,
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
            'contactsCreate',
            'contactsUpdate',
            'contactsDelete',
            'contactsMerge',
          ],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'products',
          actions: [
            'productsCreate',
            'productsUpdate',
            'productsDelete',
            'productsMerge',
            'productCategoriesManage',
            'productsConfigsManage',
            'uomsManage',
            'productRulesManage',
          ],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'properties',
          actions: ['fieldsManage', 'fieldGroupsManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'tags',
          actions: ['tagsCreate', 'tagsUpdate', 'tagsDelete', 'tagsTag'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'segments',
          actions: ['segmentsManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'documents',
          actions: ['manageDocuments', 'removeDocuments'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'brands',
          actions: ['brandsCreate', 'brandsUpdate', 'brandsDelete'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'organization',
          actions: [
            'structuresManage',
            'departmentsManage',
            'branchesManage',
            'unitsManage',
            'positionsManage',
          ],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'teamMembers',
          actions: [
            'teamMembersInvite',
            'teamMembersUpdate',
            'teamMembersRemove',
            'teamMembersResetPassword',
          ],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'broadcasts',
          actions: [
            'broadcastRead',
            'broadcastCreate',
            'broadcastUpdate',
            'broadcastDelete',
            'broadcastConfigsManage',
          ],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'bundle',
          actions: ['bundleRulesManage', 'bundleConditionsManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'exchangeRates',
          actions: ['exchangeRatesManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'permissions',
          actions: ['permissionsManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'apps',
          actions: ['appsManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'clientPortal',
          actions: ['clientPortalManage'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'automations',
          actions: [
            'automationsCreate',
            'automationsUpdate',
            'automationsDelete',
          ],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'logs',
          actions: ['logsRead'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'core:user',
      name: 'Core modules user',
      description: 'Standard user access to Core modules',
      permissions: [
        {
          plugin: 'core',
          module: 'teamMembers',
          actions: ['teamMembersUpdate'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'contacts',
          actions: ['contactsCreate', 'contactsUpdate'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'products',
          actions: ['productsCreate', 'productsUpdate'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'tags',
          actions: ['tagsTag'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'broadcasts',
          actions: ['broadcastRead', 'broadcastCreate', 'broadcastUpdate'],
          scope: 'own',
        },
      ],
    },
    {
      id: 'core:viewer',
      name: 'Core Viewer',
      description:
        'Read-only access to all Core modules, with own-data mutations',
      permissions: [
        {
          plugin: 'core',
          module: 'contacts',
          actions: ['contactsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'contacts',
          actions: ['contactsCreate', 'contactsUpdate'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'products',
          actions: ['productsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'properties',
          actions: ['propertiesRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'tags',
          actions: ['tagsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'segments',
          actions: ['segmentsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'documents',
          actions: ['documentsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'documents',
          actions: ['manageDocuments', 'removeDocuments'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'brands',
          actions: ['brandsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'organization',
          actions: ['organizationRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'teamMembers',
          actions: ['teamMembersRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'teamMembers',
          actions: ['teamMembersUpdate'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'broadcasts',
          actions: ['broadcastRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'broadcasts',
          actions: ['broadcastCreate', 'broadcastUpdate'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'bundles',
          actions: ['bundleRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'exchangeRates',
          actions: ['exchangeRatesRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'permissions',
          actions: ['permissionsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'apps',
          actions: ['appsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'clientPortal',
          actions: ['clientPortalRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'automations',
          actions: ['automationsRead'],
          scope: 'all',
        },
        {
          plugin: 'core',
          module: 'automations',
          actions: ['automationsCreate', 'automationsUpdate'],
          scope: 'own',
        },
        {
          plugin: 'core',
          module: 'internalNotes',
          actions: ['internalNotesManage'],
          scope: 'own',
        },
      ],
    },
  ],
};
