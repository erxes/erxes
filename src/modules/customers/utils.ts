import { LEAD_STATUS_TYPES, LIFECYCLE_STATE_TYPES } from './constants';

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

export const regexPhone = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/;
export const regexEmail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+[^<>()\.,;:\s@\"]{2,})$/;
