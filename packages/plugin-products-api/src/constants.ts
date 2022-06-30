export const PRODUCT_INFO = {
  code: 'Code',
  name: 'Name',
  type: 'Type',
  category: 'Category',
  vendor: 'Vendor',
  description: 'Description',
  sku: 'Sku',
  productCount: 'Product count',

  ALL: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'vendor', label: 'Vendor' },
    { field: 'description', label: 'Description' },
    { field: 'sku', label: 'Sku' },
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
    name: 'tag',
    label: 'Tag',
    type: 'string'
  }
];
