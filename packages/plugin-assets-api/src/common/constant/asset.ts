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

export const EXTEND_FIELDS = [
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
    name: 'tag',
    label: 'Tag',
    type: 'string'
  }
];
