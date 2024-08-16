import { CUSTOMER_SELECT_OPTIONS } from './models/definitions/constants';

export const generatePronoun = value => {
  const pronoun = CUSTOMER_SELECT_OPTIONS.SEX.find(
    sex => sex.label.toUpperCase() === value.toUpperCase()
  );

  return pronoun ? pronoun.value : '';
};

export const clearEmptyValues = (obj: any) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === '' || obj[key] === 'unknown') {
      delete obj[key];
    }

    if (Array.isArray(obj[key]) && obj[key].length === 0) {
      delete obj[key];
    }
  });

  return obj;
};
