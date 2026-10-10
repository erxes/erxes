import { IPosCustomerCreateConfig } from './@types/pos';

// Customer system fields a cashier can fill; owner and state come from the POS.
export const POS_CUSTOMER_SYSTEM_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'primaryEmail',
  'primaryPhone',
  'code',
  'sex',
  'birthDate',
  'description',
];

export const POS_CUSTOMER_PROPERTY_PREFIX = 'property:';

export const validateCustomerCreateConfig = (
  config?: IPosCustomerCreateConfig,
) => {
  if (!config?.enabled) {
    return;
  }

  const codes = (config.layout || []).flat();

  if (!codes.includes('primaryEmail') && !codes.includes('primaryPhone')) {
    throw new Error('The customer form must keep e-mail or phone');
  }

  const unknown = codes.find(
    (code) =>
      !POS_CUSTOMER_SYSTEM_FIELDS.includes(code) &&
      !code.startsWith(POS_CUSTOMER_PROPERTY_PREFIX),
  );

  if (unknown) {
    throw new Error(`"${unknown}" cannot be placed on the customer form`);
  }
};
