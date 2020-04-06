export const TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL: ['product', 'service']
};

export const PRODUCT_INFO = {
  name: 'Name',
  type: 'Type',
  category: 'Category',
  description: 'Description',
  sku: 'Sku',

  ALL: [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'description', label: 'Description' },
    { field: 'sku', label: 'Sku' }
  ]
};

export const PRODUCT_TYPE_CHOISES = {
  product: 'Product',
  service: 'Service'
};
