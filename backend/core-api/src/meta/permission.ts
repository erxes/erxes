export const moduleObjects = {
  brands: {
    name: 'brands',
    description: 'Brands',
    actions: [
      {
        name: 'brandsAll',
        description: 'All',
        use: ['showBrands', 'manageBrands', 'exportBrands', 'removeBrands'],
      },
      {
        name: 'manageBrands',
        description: 'Manage brands',
      },
      {
        name: 'showBrands',
        description: 'Show brands',
      },
      {
        name: 'exportBrands',
        description: 'Export brands',
      },
      {
        name: 'removeBrands',
        description: 'Remove brands',
      },
    ],
  },
  permissions: {
    name: 'permissions',
    description: 'Permissions config',
    actions: [
      {
        name: 'permissionsAll',
        description: 'All',
        use: [
          'managePermissions',
          'showPermissions',
          'showPermissionModules',
          'showPermissionActions',
          'exportPermissions',
        ],
      },
      {
        name: 'managePermissions',
        description: 'Manage permissions',
      },
      {
        name: 'showPermissions',
        description: 'Show permissions',
      },
      {
        name: 'showPermissionModules',
        description: 'Show permissions modules',
      },
      {
        name: 'showPermissionActions',
        description: 'Show permissions actions',
      },
      {
        name: 'exportPermissions',
        description: 'Export permissions',
      },
    ],
  },
  usersGroups: {
    name: 'usersGroups',
    description: 'Users Groups',
    actions: [
      {
        name: 'usersGroupsAll',
        description: 'All',
        use: ['showUsersGroups', 'manageUsersGroups'],
      },
      {
        name: 'manageUsersGroups',
        description: 'Manage users groups',
      },
      {
        name: 'showUsersGroups',
        description: 'Show users groups',
      },
    ],
  },
  users: {
    name: 'users',
    description: 'Team members',
    actions: [
      {
        name: 'usersAll',
        description: 'All',
        use: [
          'showUsers',
          'usersEdit',
          'usersInvite',
          'usersSetActiveStatus',
          'exportUsers',
        ],
      },
      {
        name: 'showUsers',
        description: 'Show team members',
      },
      {
        name: 'usersSetActiveStatus',
        description: 'Set active/inactive team member',
      },
      {
        name: 'usersEdit',
        description: 'Update team member',
      },
      {
        name: 'usersInvite',
        description: 'Invite team member',
      },
      {
        name: 'exportUsers',
        description: 'Export team members',
      },
    ],
  },
  importHistories: {
    name: 'importHistories',
    description: 'Import histories',
    actions: [
      {
        name: 'importHistoriesAll',
        description: 'All',
        use: ['importHistories', 'removeImportHistories', 'importXlsFile'],
      },
      {
        name: 'importXlsFile',
        description: 'Import xls files',
      },
      {
        name: 'removeImportHistories',
        description: 'Remove import histories',
      },
      {
        name: 'importHistories',
        description: 'Show import histories',
      },
    ],
  },
  generalSettings: {
    name: 'generalSettings',
    description: 'General settings',
    actions: [
      {
        name: 'generalSettingsAll',
        description: 'All',
        use: ['manageGeneralSettings', 'showGeneralSettings'],
      },
      {
        name: 'showGeneralSettings',
        description: 'Show general settings',
      },
      {
        name: 'manageGeneralSettings',
        description: 'Manage general settings',
      },
    ],
  },
  structures: {
    name: 'structures',
    description: 'Structure',
    actions: [
      {
        name: 'structuresAll',
        description: 'All',
        use: [
          'showStructure',
          'addStructure',
          'editStructure',
          'removeStructure',
        ],
      },
      {
        name: 'showStructure',
        description: 'Show a structure',
      },
      {
        name: 'addStructure',
        description: 'Create a structure',
      },
      {
        name: 'editStructure',
        description: 'Edit a structure',
      },
      {
        name: 'removeStructure',
        description: 'Remove a structure',
      },
    ],
  },
  departments: {
    name: 'departments',
    description: 'Department',
    actions: [
      {
        name: 'departmentsAll',
        description: 'All',
        use: [
          'addDepartment',
          'showDepartment',
          'editDepartment',
          'removeDepartment',
        ],
      },
      {
        name: 'showDepartment',
        description: 'Show a department',
      },
      {
        name: 'addDepartment',
        description: 'Create a department',
      },
      {
        name: 'editDepartment',
        description: 'Edit a department',
      },
      {
        name: 'removeDepartment',
        description: 'Remove a department',
      },
    ],
  },
  units: {
    name: 'units',
    description: 'Unit',
    actions: [
      {
        name: 'unitsAll',
        description: 'All',
        use: ['showUnit', 'addUnit', 'editUnit', 'removeUnit'],
      },
      {
        name: 'showUnit',
        description: 'Show a unit',
      },
      {
        name: 'addUnit',
        description: 'Create a unit',
      },
      {
        name: 'editUnit',
        description: 'Edit a unit',
      },
      {
        name: 'removeUnit',
        description: 'Remove a unit',
      },
    ],
  },
  branches: {
    name: 'branches',
    description: 'Branch',
    actions: [
      {
        name: 'branchesAll',
        description: 'All',
        use: ['showBranch', 'addBranch', 'editBranch', 'removeBranch'],
      },
      {
        name: 'showBranch',
        description: 'Show a branch',
      },
      {
        name: 'addBranch',
        description: 'Create a branch',
      },
      {
        name: 'editBranch',
        description: 'Edit a branch',
      },
      {
        name: 'removeBranch',
        description: 'Remove a branch',
      },
    ],
  },
  tags: {
    name: 'tags',
    description: 'Tags',
    actions: [
      {
        name: 'tagsAll',
        description: 'All',
        use: ['showTags', 'manageTags'],
      },
      {
        name: 'manageTags',
        description: 'Manage tags',
      },
      {
        name: 'showTags',
        description: 'Show tags',
      },
    ],
  },
  logs: {
    name: 'logs',
    description: 'Logs',
    actions: [
      {
        name: 'viewLogs',
        description: 'View logs',
      },
    ],
  },
  segments: {
    name: 'segments',
    description: 'Segments',
    actions: [
      {
        name: 'segmentsAll',
        description: 'All',
        use: ['showSegments', 'manageSegments'],
      },
      {
        name: 'manageSegments',
        description: 'Manage segments',
      },
      {
        name: 'showSegments',
        description: 'Show segments list',
      },
    ],
  },
  forms: {
    name: 'forms',
    description: 'Form',
    actions: [
      {
        name: 'formsAll',
        description: 'All',
        use: ['showForms', 'manageForms'],
      },
      {
        name: 'manageForms',
        description: 'Manage forms',
      },
      {
        name: 'showForms',
        description: 'Show forms',
      },
    ],
  },
  companies: {
    name: 'companies',
    description: 'Companies',
    actions: [
      {
        name: 'companiesAll',
        description: 'All',
        use: [
          'companiesAdd',
          'companiesEdit',
          'companiesRemove',
          'companiesMerge',
          'showCompanies',
          'showCompaniesMain',
          'exportCompanies',
        ],
      },
      {
        name: 'companiesAdd',
        description: 'Add companies',
      },
      {
        name: 'companiesEdit',
        description: 'Edit companies',
      },
      {
        name: 'companiesRemove',
        description: 'Remove companies',
      },
      {
        name: 'companiesMerge',
        description: 'Merge companies',
      },
      {
        name: 'showCompanies',
        description: 'Show companies',
      },
      {
        name: 'showCompaniesMain',
        description: 'Show companies main',
      },
      {
        name: 'exportCompanies',
        description: 'Export companies to xls file',
      },
    ],
  },

  customers: {
    name: 'customers',
    description: 'Customers',
    actions: [
      {
        name: 'customersAll',
        description: 'All',
        use: [
          'showCustomers',
          'customersAdd',
          'customersEdit',
          'customersMerge',
          'customersRemove',
          'exportCustomers',
          'customersChangeState',
        ],
      },
      {
        name: 'exportCustomers',
        description: 'Export customers',
      },
      {
        name: 'showCustomers',
        description: 'Show customers',
      },
      {
        name: 'customersAdd',
        description: 'Add customer',
      },
      {
        name: 'customersEdit',
        description: 'Edit customer',
      },
      {
        name: 'customersMerge',
        description: 'Merge customers',
      },
      {
        name: 'customersRemove',
        description: 'Remove customers',
      },
      {
        name: 'customersChangeState',
        description: 'Change customer state',
      },
    ],
  },

  clientPortalUsers: {
    name: 'clientPortalUsers',
    description: 'Client portal users',
    actions: [
      {
        name: 'clientPortalUsersAll',
        description: 'All',
        use: ['showClientPortalUsers', 'manageClientPortalUsers'],
      },
      {
        name: 'showClientPortalUsers',
        description: 'Show client portal users',
      },
      {
        name: 'manageClientPortalUsers',
        description: 'Manage client portal users',
      },
    ],
  },

  products: {
    name: 'products',
    description: 'Products',
    actions: [
      {
        name: 'productsAll',
        description: 'All',
        use: [
          'showProducts',
          'manageProducts',
          'productsMerge',
          'removeProducts',
        ],
      },
      {
        name: 'manageProducts',
        description: 'Manage products',
      },
      {
        name: 'removeProducts',
        description: 'Remove products',
      },
      {
        name: 'showProducts',
        description: 'Show products',
      },
      {
        name: 'productsMerge',
        description: 'Merge products',
      },
    ],
  },

  emailTemplates: {
    name: 'emailTemplates',
    description: 'Email template',
    actions: [
      {
        name: 'emailTemplateAll',
        description: 'All',
        use: [
          'showEmailTemplates',
          'manageEmailTemplate',
          'removeEmailTemplate',
        ],
      },
      {
        name: 'manageEmailTemplate',
        description: 'Manage email template',
      },
      {
        name: 'removeEmailTemplate',
        description: 'Remove email template',
      },
      {
        name: 'showEmailTemplates',
        description: 'Show email templates',
      },
    ],
  },

  exchangeRates: {
    name: 'exchangeRates',
    description: 'ExchangeRates',
    actions: [
      {
        name: 'exchangeRatesAll',
        description: 'All',
        use: ['showExchangeRates', 'manageExchangeRates'],
      },
      {
        name: 'manageExchangeRates',
        description: 'Manage exchange rates',
      },
      {
        name: 'showExchangeRates',
        description: 'Show exchange rates',
      },
    ],
  },

  clients: {
    name: 'clients',
    description: 'App Clients',
    actions: [
      {
        name: 'clientsAll',
        description: 'All',
        use: ['showClients', 'manageClients', 'removeClients'],
      },
      {
        name: 'manageClients',
        description: 'Manage clients',
      },
      {
        name: 'removeClients',
        description: 'Remove clients',
      },
      {
        name: 'showClients',
        description: 'Show clients',
      },
    ],
  },
};
