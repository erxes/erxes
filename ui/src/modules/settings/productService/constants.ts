export const TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL: ['product', 'service']
};

export const PRODUCT_INFO = {
  name: 'Name',
  type: 'Type',
  category: 'Category',
  code: 'Code',
  description: 'Description',
  sku: 'Sku',
  unitPrice: 'UnitPrice',

  ALL: [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'code', label: 'Code' },
    { field: 'description', label: 'Description' },
    { field: 'sku', label: 'Sku' },
    { field: 'unitPrice', label: 'UnitPrice' },
  ]
};

export const PRODUCT_TYPE_CHOISES = {
  product: 'Product',
  service: 'Service'
};
