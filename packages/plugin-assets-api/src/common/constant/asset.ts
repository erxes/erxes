export const ASSET_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived']
};

export const ASSET_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted']
};

export const ASSET_INFO = {
  code: 'Code',
  name: 'Name',
  category: 'Category',
  parent: 'Parent',
  vendor: 'Vendor',
  description: 'Description',
  productCount: 'Product count',

  ALL: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'category', label: 'Category' },
    { field: 'parent', label: 'Parent' },
    { field: 'vendor', label: 'Vendor' },
    { field: 'description', label: 'Description' },
    { field: 'productCount', label: 'Product count' }
  ]
};

export const ASSET_EXTEND_FIELDS = [
  {
    _id: Math.random(),
    name: 'categoryName',
    label: 'Category Name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'parentName',
    label: 'Parent Name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'parentCode',
    label: 'Parent Code',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'tag',
    label: 'Tag',
    type: 'string'
  }
];

export const ASSETS_MOVEMENT_EXTEND_FIELDS = [
  {
    _id: Math.random(),
    name: 'assetName',
    label: 'Asset Name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'assetCode',
    label: 'Asset Code',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'branchName',
    label: 'Branch Name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'branchCode',
    label: 'Branch Code',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'departmentName',
    label: 'Department Name',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'departmentCode',
    label: 'Department Code',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'customerEmail',
    label: 'Customer Email',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'companyEmail',
    label: 'Company Email',
    type: 'string'
  },
  {
    _id: Math.random(),
    name: 'teamMemberEmail',
    label: 'Team Member Email',
    type: 'string'
  }
];
