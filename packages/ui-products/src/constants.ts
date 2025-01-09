export const TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  UNIQUE: 'unique',
  SUBSCRIPTION: 'subscription',
  ALL: ['product', 'service', 'unique']
};

export const PRODUCT_CATEGORY_STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' }
];

export const PRODUCT_INFO = {
  code: 'Code',
  name: 'Name',
  shortName: 'Short name',
  type: 'Type',
  category: 'Category',
  vendor: 'Vendor',
  description: 'Description',
  barcodes: 'Barcodes',
  barcodeDescription: 'Barcode description',
  unitPrice: 'Unit price',
  tags: 'Tags',
  status: 'Status',
  uom: 'Unit of measurement',
  subUoms: 'Sub unit of measurements',

  ALL: [
    { field: 'code', label: 'Code' },
    { field: 'name', label: 'Name' },
    { field: 'shortName', label: 'Short name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'vendor', label: 'Vendor' },
    { field: 'description', label: 'Description' },
    { field: 'barcodes', label: 'Barcodes' },
    { field: 'barcodeDescription', label: 'Barcode description' },
    { field: 'unitPrice', label: 'Unit price' },
    { field: 'tags', label: 'Tags' },
    { field: 'status', label: 'Status' },
    { field: 'uom', label: 'Unit of measurement' },
    { field: 'subUoms', label: 'Sub unit of measurements' },
  ]
};
