import { __ } from '@erxes/ui/src';

export const ASSET_CATEGORY_STATUSES = [
  { label: 'Active', value: 'active' },
  { label: 'Disabled', value: 'disabled' },
  { label: 'Archived', value: 'archived' }
];

export const ASSET_INFO = {
  name: 'Name',
  type: 'Type',
  category: 'category',
  parent: 'parent',
  code: 'Code',
  description: 'Description',
  unitPrice: 'UnitPrice',
  vendor: 'Vendor',

  ALL: [
    { field: 'name', label: 'Name' },
    { field: 'type', label: 'Type' },
    { field: 'category', label: 'Category' },
    { field: 'parent', label: 'Parent' },
    { field: 'code', label: 'Code' },
    { field: 'description', label: 'Description' },
    { field: 'unitPrice', label: 'UnitPrice' },
    { field: 'vendor', label: 'Vendor' }
  ]
};

export const ASSET_CATEGORY_STATUS_FILTER = {
  disabled: 'Disabled',
  archived: 'Archived'
};

export const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Assets') }
];

export const menuMovements = [
  { title: 'Movements', link: '/asset-movements' },
  { title: 'Assets', link: '/asset-movement-items' }
];

export const checkKnowledge = [
  {
    title: 'Assigned',
    label: 'Assigned Knowledgebase',
    icon: 'file-bookmark-alt'
  },
  {
    title: 'Designated',
    label: 'Designated Knowledgebase',
    icon: 'file-times'
  }
];
