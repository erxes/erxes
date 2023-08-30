export const USER_PROPERTIES_INFO = {
  email: 'Primary email',
  username: 'User name',
  ALL: [
    { field: 'email', label: 'Primary email', canHide: false },
    { field: 'username', label: 'User name' }
  ]
};

export const STRUCTURE_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted'
};

export const USER_MOVEMENT_STATUSES = {
  CREATED: 'created',
  REMOVED: 'removed'
};

export const USER_EXTENDED_FIELDS = [
  {
    _id: Math.random(),
    name: 'departments',
    label: 'Departments',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'branches',
    label: 'Branches',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'password',
    label: 'password',
    type: 'string'
  }
];

export const USER_EXPORT_EXTENDED_FIELDS = [
  {
    _id: Math.random(),
    name: 'departments',
    label: 'Departments',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'branches',
    label: 'Branches',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: '_id',
    label: 'Employee Id',
    type: 'string'
  }
];
