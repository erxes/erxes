export const PRODUCT_INFO = {
  code: 'Code',
  name: 'Name',
  type: 'Type',
  category: 'Category',
  vendor: 'Vendor',
  description: 'Description',
  uom: 'UOM',
  productCount: 'Product count',

  ALL: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'vendor', label: 'Vendor' },
    { field: 'description', label: 'Description' },
    { field: 'uom', label: 'Uom' },
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
  },
  {
    _id: Math.random(),
    name: 'barcodes',
    label: 'Barcodes',
    type: 'string'
  }
];
