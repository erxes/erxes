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
  'statusCustom',
  'jointOrSingle',
  'dormancyDate',
  'statusDate',
  'flagNoCredit',
  'flagNoDebit',
  'salaryAcnt',
  'corporateAcnt',
  'capAcntCode',
  'capMethod',
  'segCode',
  'paymtDefault',
  'odType',
];

export const validateDepositObject = async (value: IPolarisDeposit) => {
  for (const key of requiredKeys) {
    if (!value[key]) throw new Error(`${key} value not filled`);
  }
};
