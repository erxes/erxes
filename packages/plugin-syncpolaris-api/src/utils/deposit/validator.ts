import { IPolarisDeposit } from './types';

const requiredKeys = [
  'acntType',
  'prodCode',
  'brchCode',
  'curCode',
  'custCode',
  'name',
  'name2',
  'slevel',
  'jointOrSingle',
  'flagNoCredit',
  'flagNoDebit',
  'salaryAcnt',
  'corporateAcnt',
  'capMethod',
  'segCode',
  'odType',
];

export const validateDepositObject = async (value: IPolarisDeposit) => {
  for (const key of requiredKeys) {
    if (!value[key]) throw new Error(`${key} value not filled`);
  }
};
