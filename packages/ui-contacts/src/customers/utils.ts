import { GENDER_TYPES } from './constants';
import { __ } from '@erxes/ui/src/utils';

export const genderChoices = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(GENDER_TYPES())) {
    options.push({
      value: key,
      label: __(GENDER_TYPES()[key])
    });
  }

  return options;
};

export const isValidPhone = (phone: string) => {
  const phoneRegex = /^(\+*)(\d*)(\(\d{1,3}\)*)?(\s?\d+|\+\d{2,3}\s\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s*)$/;
  return phoneRegex.test(phone);
};
