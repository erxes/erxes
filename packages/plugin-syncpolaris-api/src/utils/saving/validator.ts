import { IPolarisSaving, IPolarisUpdateSaving } from './types';

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
  'jointOrSingle'
];

const requiredUpdateKeys = [
  'prodCode',
  'slevel',
  'capMethod',
  'acntCode',
  'startDate',
  'maturityOption',
  'brchCode',
  'curCode',
  'name',
  'name2',
  'termLen',
  'tenor',
  'custCode',
  'jointOrSingle'
];

export const validateSavingObject = async (value: IPolarisSaving) => {
  for (const key of requiredKeys) {
    if (!value[key]) throw new Error(`${key} value not filled`);
  }
};

export const validateUpdateSavingObject = async (
  value: IPolarisUpdateSaving
) => {
  for (const key of requiredUpdateKeys) {
    if (value[key] === undefined || value[key] === null)
      throw new Error(`${key} value not filled`);
  }
};
