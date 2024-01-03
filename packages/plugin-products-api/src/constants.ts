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
  taxType: 'Tax type',
  taxCode: 'Tax code',

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
    { field: 'taxType', label: 'Tax type' },
    { field: 'taxCode', label: 'Tax code' }
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
