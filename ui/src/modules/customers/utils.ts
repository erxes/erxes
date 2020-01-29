import {
  GENDER_TYPES,
  LEAD_STATUS_TYPES,
  LIFECYCLE_STATE_TYPES
} from './constants';

export const hasAnyActivity = log => {
  let hasAny = false;

  log.forEach(item => {
    if (item) {
      hasAny = true;
    }
  });

  return hasAny;
};

export const leadStatusChoices = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(LEAD_STATUS_TYPES)) {
    options.push({
      value: key,
      label: __(LEAD_STATUS_TYPES[key])
    });
  }

  return options;
};

export const genderChoices = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(GENDER_TYPES)) {
    options.push({
      value: key,
      label: __(GENDER_TYPES[key])
    });
  }

  return options;
};

export const lifecycleStateChoices = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(LIFECYCLE_STATE_TYPES)) {
    options.push({
      value: key,
      label: __(LIFECYCLE_STATE_TYPES[key])
    });
  }

  return options;
};

export const isValidPhone = (phone: string) => {
  const phoneRegex = /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm;

  return phoneRegex.test(phone);
};
