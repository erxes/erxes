export const PRODUCT_INFO = {
  name: 'Name',
  type: 'Type',
  category: 'Category',
  code: 'Code',
  description: 'Description',
  sku: 'Sku',
  unitPrice: 'UnitPrice',
  vendor: 'Vendor',

  ALL: [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'code', label: 'Code' },
    { field: 'description', label: 'Description' },
    { field: 'sku', label: 'Sku' },
    { field: 'unitPrice', label: 'UnitPrice' },
    { field: 'vendor', label: 'Vendor' }
  ]
};

export const PRODUCT_TYPE_CHOISES = {
  product: 'Product',
  service: 'Service'
};

export const PRODUCT_CATEGORIES_STATUS = ['active', 'disabled', 'archived'];
