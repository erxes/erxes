import { TAutomationPropertyTypeDefinition } from 'erxes-api-shared/core-modules';

export const coreAutomationPropertyTypes: TAutomationPropertyTypeDefinition[] = [
  {
    value: 'core:user',
    label: 'Team Member',
    fields: [
      { label: 'ID', value: '_id', type: 'Id' },
      { label: 'Email', value: 'email', type: 'String' },
      { label: 'Username', value: 'username', type: 'String' },
      { label: 'Code', value: 'code', type: 'String' },
      { label: 'Employee ID', value: 'employeeId', type: 'String' },
    ],
  },
  {
    value: 'core:customer',
    label: 'Customer',
    fields: [
      { label: 'ID', value: '_id', type: 'Id' },
      { label: 'Name', value: 'name', type: 'String' },
      { label: 'Email', value: 'email', type: 'String' },
      { label: 'Phone', value: 'phone', type: 'String' },
    ],
  },
  {
    value: 'core:company',
    label: 'Company',
    fields: [
      { label: 'ID', value: '_id', type: 'Id' },
      { label: 'Name', value: 'name', type: 'String' },
      { label: 'Email', value: 'email', type: 'String' },
      { label: 'Phone', value: 'phone', type: 'String' },
    ],
  },
  {
    value: 'core:product',
    label: 'Product',
    fields: [
      { label: 'ID', value: '_id', type: 'Id' },
      { label: 'Name', value: 'name', type: 'String' },
      { label: 'Code', value: 'code', type: 'String' },
    ],
  },
  {
    value: 'core:tag',
    label: 'Tag',
    fields: [
      { label: 'ID', value: '_id', type: 'Id' },
      { label: 'Name', value: 'name', type: 'String' },
    ],
  },
];
