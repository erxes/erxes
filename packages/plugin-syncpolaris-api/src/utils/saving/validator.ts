import { IPolarisDeposit, IPolarisUpdateDeposit } from './types';

const requiredKeys = [
  'prodCode',
  'slevel',
  'capMethod',
  'capAcntCode',
  'capAcntSysNo',
  'startDate',
  'maturityOption',
  'brchCode',
  'curCode',
  'name',
  'name2',
  'termLen',
  'custCode',
  'jointOrSingle',
];

export const validateDepositObject = async (value: IPolarisDeposit) => {
  for (const key of requiredKeys) {
    if (!value[key]) throw new Error(`${key} value not filled`);
  }
};

export const validateUpdateDepositObject = async (
  value: IPolarisUpdateDeposit
) => {
  for (const key of requiredKeys) {
    if (value[key] === undefined || value[key] === null)
      throw new Error(`${key} value not filled`);
  }
};
