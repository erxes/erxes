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

export const TEMPLATE_STATUS_CHOISES = {
  active: 'Active',
  archived: 'Archived'
};

export const PRODUCT_TEMPLATE_STATUSES = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  ALL: ['active', 'archived']
}

export const TYPE_CHOICES = [    
  { value: 'productService', label: 'Product & Service' },
  { value: 'email', label: 'Email' },
  { value: 'chatResponse', label: 'Chat Response' },
  { value: 'growthHacking', label: 'Growth Hacking' },
];

const COMMON_VALUES = {
  TEN: '10%',
  TWENTY: '20%',
  THIRTY: '30%',
  FOURTY: '40%',
  FIFTY: '50%',
  SIXTY: '60%',
  SEVENTY: '70%',
  EIGHTY: '80%',
  NINETY: '90%'
};

const COMMON_PERCENT = [
  '10%',
  '20%',
  '30%',
  '40%',
  '50%',
  '60%',
  '70%',
  '80%',
  '90%'
];

export const PROBABILITY = {
  ...COMMON_VALUES,
  deal: {
    WON: 'Won',
    LOST: 'Lost',
    ALL: [...COMMON_PERCENT, 'Won', 'Lost']
  },
  task: {
    DONE: 'Done',
    ALL: [...COMMON_PERCENT, 'Done']
  },
  ticket: {
    RESOLVED: 'Resolved',
    ALL: [...COMMON_PERCENT, 'Resolved']
  }
};
