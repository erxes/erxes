export const moduleObjects = {
  brands: {
    name: 'brands',
    description: 'Brands',
    actions: [
      {
        name: 'brandsAll',
        description: 'All',
        use: ['showBrands', 'manageBrands', 'exportBrands']
      },
      {
        name: 'manageBrands',
        description: 'Manage brands'
      },
      {
        name: 'showBrands',
        description: 'Show brands'
      },
      {
        name: 'exportBrands',
        description: 'Export brands'
      }
    ]
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
          'exportPermissions'
        ]
      },
      {
        name: 'managePermissions',
        description: 'Manage permissions'
      },
      {
        name: 'showPermissions',
        description: 'Show permissions'
      },
      {
        name: 'showPermissionModules',
        description: 'Show permissions modules'
      },
      {
        name: 'showPermissionActions',
        description: 'Show permissions actions'
      },
      {
        name: 'exportPermissions',
        description: 'Export permissions'
      }
    ]
  },
  usersGroups: {
    name: 'usersGroups',
    description: 'Users Groups',
    actions: [
      {
        name: 'usersGroupsAll',
        description: 'All',
        use: ['showUsersGroups', 'manageUsersGroups']
      },
      {
        name: 'manageUsersGroups',
        description: 'Manage users groups'
      },
      {
        name: 'showUsersGroups',
        description: 'Show users groups'
      }
    ]
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
          'exportUsers'
        ]
      },
      {
        name: 'showUsers',
        description: 'Show team members'
      },
      {
        name: 'usersSetActiveStatus',
        description: 'Set active/deactive team member'
      },
      {
        name: 'usersEdit',
        description: 'Update team member'
      },
      {
        name: 'usersInvite',
        description: 'Invite team member'
      },
      {
        name: 'exportUsers',
        description: 'Export team members'
      }
    ]
  },
  importHistories: {
    name: 'importHistories',
    description: 'Import histories',
    actions: [
      {
        name: 'importHistoriesAll',
        description: 'All',
        use: ['importHistories', 'removeImportHistories', 'importXlsFile']
      },
      {
        name: 'importXlsFile',
        description: 'Import xls files'
      },
      {
        name: 'removeImportHistories',
        description: 'Remove import histories'
      },
      {
        name: 'importHistories',
        description: 'Show import histories'
      }
    ]
  },
  generalSettings: {
    name: 'generalSettings',
    description: 'General settings',
    actions: [
      {
        name: 'generalSettingsAll',
        description: 'All',
        use: ['manageGeneralSettings', 'showGeneralSettings']
      },
      {
        name: 'showGeneralSettings',
        description: 'Show general settings'
      },
      {
        name: 'manageGeneralSettings',
        description: 'Manage general settings'
      }
    ]
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
          'removeStructure'
        ]
      },
      {
        name: 'showStructure',
        description: 'Show a structure'
      },
      {
        name: 'addStructure',
        description: 'Create a structure'
      },
      {
        name: 'editStructure',
        description: 'Edit a structure'
      },
      {
        name: 'removeStructure',
        description: 'Remove a structure'
      }
    ]
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
          'removeDepartment'
        ]
      },
      {
        name: 'showDepartment',
        description: 'Show a department'
      },
      {
        name: 'addDepartment',
        description: 'Create a department'
      },
      {
        name: 'editDepartment',
        description: 'Edit a department'
      },
      {
        name: 'removeDepartment',
        description: 'Remove a department'
      }
    ]
  },
  units: {
    name: 'units',
    description: 'Unit',
    actions: [
      {
        name: 'unitsAll',
        description: 'All',
        use: ['showUnit', 'addUnit', 'editUnit', 'removeUnit']
      },
      {
        name: 'showUnit',
        description: 'Show a unit'
      },
      {
        name: 'addUnit',
        description: 'Create a unit'
      },
      {
        name: 'editUnit',
        description: 'Edit a unit'
      },
      {
        name: 'removeUnit',
        description: 'Remove a unit'
      }
    ]
  },
  branches: {
    name: 'branches',
    description: 'Branch',
    actions: [
      {
        name: 'branchesAll',
        description: 'All',
        use: ['showBranch', 'addBranch', 'editBranch', 'removeBranch']
      },
      {
        name: 'showBranch',
        description: 'Show a branch'
      },
      {
        name: 'addBranch',
        description: 'Create a branch'
      },
      {
        name: 'editBranch',
        description: 'Edit a branch'
      },
      {
        name: 'removeBranch',
        description: 'Remove a branch'
      }
    ]
  }
};
