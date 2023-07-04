export const ACCOUNT_INFO = {
  code: 'Code',
  name: 'Name',
  type: 'Type',
  category: 'Category',
  ALL: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' }
  ]
};

export const EXTEND_FIELDS = [
  {
    _id: Math.random(),
    name: 'categoryName',
    label: 'Category Name',
    type: 'string'
  }
];
