import { IPolarisLoan, IPolarisUpdateLoan } from './types';

const requiredKeys = [
  'custCode',
  'name',
  'prodCode',
  'purpose',
  'subPurpose',
  'approvAmount',
  'termLen',
  'brchCode',
  'acntManager',
  'startDate',
  'endDate',
  'approvDate',
];

const requiredUpdateKeys = [
  'acntCode',
  'custCode',
  'name',
  'prodCode',
  'purpose',
  'subPurpose',
  'approvAmount',
  'acntManager',
  'brchCode',
  'startDate',
  'endDate',
  'approvDate',
];

export const validateLoanObject = async (value: IPolarisLoan) => {
  for (const key of requiredKeys) {
    if (!value[key]) throw new Error(`${key} value not filled`);
  }
};

export const validateUpdateLoanObject = async (value: IPolarisUpdateLoan) => {
  for (const key of requiredUpdateKeys) {
    if (value[key] === undefined || value[key] === null)
      throw new Error(`${key} value not filled`);
  }
};
