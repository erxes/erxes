import { IPolarisCustomer } from './types';

const keys = [
  'custSegCode',
  'isVatPayer',
  'sexCode',
  'status',
  'isCompanyCustomer',
  'industryId',
  'familyName',
  'lastName',
  'firstName',
  'registerMaskCode',
  'registerCode',
  'birthDate',
  'mobile',
  'countryCode',
  'email',
  'phone',
];

export const validateObject = async (value: IPolarisCustomer) => {
  for (const key of keys) {
    if (value[key] === undefined) throw new Error(`${key} value not filled`);
  }
};
