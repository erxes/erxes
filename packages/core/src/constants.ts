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
    name: 'department',
    label: 'Department',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'branch',
    label: 'Branch',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'brand',
    label: 'Brand',
    type: 'string'
  }
];
