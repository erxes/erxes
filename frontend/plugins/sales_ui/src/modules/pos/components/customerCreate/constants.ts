// Customer system fields a cashier can fill; owner and state come from the POS.
export const POS_CUSTOMER_SYSTEM_FIELDS: { code: string; name: string }[] = [
  { code: 'primaryEmail', name: 'Primary e-mail' },
  { code: 'primaryPhone', name: 'Primary phone' },
  { code: 'firstName', name: 'First name' },
  { code: 'lastName', name: 'Last name' },
  { code: 'middleName', name: 'Middle name' },
  { code: 'code', name: 'Code' },
  { code: 'sex', name: 'Pronoun' },
  { code: 'birthDate', name: 'Birthday' },
  { code: 'description', name: 'Description' },
];

// A customer must be reachable by one of these.
export const POS_CUSTOMER_IDENTITY_CODES = ['primaryEmail', 'primaryPhone'];

export const POS_CUSTOMER_PROPERTY_PREFIX = 'property:';

export const POS_CUSTOMER_DEFAULT_LAYOUT = [
  ['primaryEmail', 'primaryPhone'],
  ['firstName', 'lastName'],
];
