import { TRecordReferencesConfig } from 'erxes-api-shared/core-modules';

export const CORE_REFERENCE_TYPES: TRecordReferencesConfig['types'] = [
  {
    type: 'customer',
    label: 'Customer',
    fields: [
      {
        key: 'displayName',
        label: 'Display name',
        resolver: 'customerDisplayName',
      },
      { key: '_id', label: 'Customer ID' },
      { key: 'firstName', label: 'First name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'middleName', label: 'Middle name' },
      { key: 'fullName', label: 'Full name', resolver: 'customerFullName' },
      { key: 'primaryEmail', label: 'Primary email' },
      { key: 'email', label: 'Email', path: 'primaryEmail' },
      { key: 'emails', label: 'Emails' },
      { key: 'primaryPhone', label: 'Primary phone' },
      { key: 'phone', label: 'Phone', path: 'primaryPhone' },
      { key: 'phones', label: 'Phones' },
      { key: 'primaryAddress', label: 'Primary address' },
      { key: 'addresses', label: 'Addresses' },
      { key: 'state', label: 'State' },
      { key: 'status', label: 'Status' },
      { key: 'code', label: 'Code' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'leadStatus', label: 'Lead status' },
      { key: 'description', label: 'Description' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },

      {
        key: 'owner',
        label: 'Owner',
        reference: {
          type: 'user',
          kind: 'field',
          path: 'ownerId',
        },
      },

      {
        key: 'tags',
        label: 'Tags',
        reference: {
          type: 'tag',
          kind: 'field',
          path: 'tagIds',
        },
      },

      {
        key: 'mergedCustomers',
        label: 'Merged customers',
        reference: {
          type: 'customer',
          kind: 'field',
          path: 'mergedIds',
        },
      },
    ],
  },

  {
    type: 'company',
    label: 'Company',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'primaryName' },
      { key: '_id', label: 'Company ID' },
      { key: 'primaryName', label: 'Primary name' },
      { key: 'name', label: 'Name', path: 'primaryName' },
      { key: 'names', label: 'Names' },
      { key: 'primaryEmail', label: 'Primary email' },
      { key: 'email', label: 'Email', path: 'primaryEmail' },
      { key: 'emails', label: 'Emails' },
      { key: 'primaryPhone', label: 'Primary phone' },
      { key: 'phone', label: 'Phone', path: 'primaryPhone' },
      { key: 'phones', label: 'Phones' },
      { key: 'primaryAddress', label: 'Primary address' },
      { key: 'addresses', label: 'Addresses' },
      { key: 'size', label: 'Size' },
      { key: 'industry', label: 'Industry' },
      { key: 'website', label: 'Website' },
      { key: 'status', label: 'Status' },
      { key: 'businessType', label: 'Business type' },
      { key: 'description', label: 'Description' },
      { key: 'employees', label: 'Employees' },
      { key: 'code', label: 'Code' },
      { key: 'location', label: 'Location' },
      { key: 'score', label: 'Score' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },

      {
        key: 'owner',
        label: 'Owner',
        reference: {
          type: 'user',
          kind: 'field',
          path: 'ownerId',
        },
      },

      {
        key: 'parentCompany',
        label: 'Parent company',
        reference: {
          type: 'company',
          kind: 'field',
          path: 'parentCompanyId',
        },
      },

      {
        key: 'tags',
        label: 'Tags',
        reference: {
          type: 'tag',
          kind: 'field',
          path: 'tagIds',
        },
      },

      {
        key: 'mergedCompanies',
        label: 'Merged companies',
        reference: {
          type: 'company',
          kind: 'field',
          path: 'mergedIds',
        },
      },
    ],
  },

  {
    type: 'product',
    label: 'Product',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'name' },
      { key: '_id', label: 'Product ID' },
      { key: 'name', label: 'Name' },
      { key: 'shortName', label: 'Short name' },
      { key: 'code', label: 'Code' },
      { key: 'type', label: 'Type' },
      { key: 'unitPrice', label: 'Unit price' },
      { key: 'status', label: 'Status' },
      { key: 'description', label: 'Description' },
      { key: 'barcodes', label: 'Barcodes' },
      { key: 'uom', label: 'UOM' },
      { key: 'currency', label: 'Currency' },
      { key: 'categoryId', label: 'Category ID' },
      { key: 'vendorId', label: 'Vendor ID' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },

      {
        key: 'vendor',
        label: 'Vendor',
        reference: {
          type: 'company',
          kind: 'field',
          path: 'vendorId',
        },
      },

      {
        key: 'tags',
        label: 'Tags',
        reference: {
          type: 'tag',
          kind: 'field',
          path: 'tagIds',
        },
      },

      {
        key: 'mergedProducts',
        label: 'Merged products',
        reference: {
          type: 'product',
          kind: 'field',
          path: 'mergedIds',
        },
      },
    ],
  },

  {
    type: 'tag',
    label: 'Tag',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'name' },
      { key: '_id', label: 'Tag ID' },
      { key: 'name', label: 'Name' },
      { key: 'colorCode', label: 'Color' },
      { key: 'type', label: 'Content type' },
      { key: 'description', label: 'Description' },
      { key: 'isGroup', label: 'Is group' },
      { key: 'objectCount', label: 'Object count' },
      { key: 'order', label: 'Order' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },

      {
        key: 'parent',
        label: 'Parent tag',
        reference: {
          type: 'tag',
          kind: 'field',
          path: 'parentId',
        },
      },
    ],
  },

  {
    type: 'user',
    label: 'Team member',
    fields: [
      {
        key: 'displayName',
        label: 'Display name',
        path: 'details.fullName',
      },
      { key: '_id', label: 'User ID' },
      { key: 'email', label: 'Email' },
      { key: 'username', label: 'Username' },
      { key: 'fullName', label: 'Full name', path: 'details.fullName' },
      { key: 'firstName', label: 'First name', path: 'details.firstName' },
      { key: 'lastName', label: 'Last name', path: 'details.lastName' },
      {
        key: 'operatorPhone',
        label: 'Operator phone',
        path: 'details.operatorPhone',
      },
      { key: 'position', label: 'Position', path: 'details.position' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'status', label: 'Status' },

      {
        key: 'branches',
        label: 'Branches',
        reference: {
          type: 'branch',
          kind: 'field',
          path: 'branchIds',
        },
      },

      {
        key: 'departments',
        label: 'Departments',
        reference: {
          type: 'department',
          kind: 'field',
          path: 'departmentIds',
        },
      },
    ],
  },

  {
    type: 'branch',
    label: 'Branch',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'title' },
      { key: '_id', label: 'Branch ID' },
      { key: 'title', label: 'Title' },
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
    ],
  },

  {
    type: 'department',
    label: 'Department',
    fields: [
      { key: 'displayName', label: 'Display name', path: 'title' },
      { key: '_id', label: 'Department ID' },
      { key: 'title', label: 'Title' },
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
    ],
  },
];
