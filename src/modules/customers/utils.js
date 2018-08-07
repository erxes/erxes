import { LEAD_STATUS_TYPES, LIFECYCLE_STATE_TYPES } from './constants';

const hasAnyActivity = log => {
  let hasAny = false;

  log.forEach(item => {
    if (item.list.length > 0) {
      hasAny = true;
    }
  });

  return hasAny;
};

const leadStatusChoices = __ => {
  const options = [];

  for (const key of Object.keys(LEAD_STATUS_TYPES)) {
    options.push({
      value: key,
      label: __(LEAD_STATUS_TYPES[key])
    });
  }

  return options;
};

const lifecycleStateChoices = __ => {
  const options = [];

  for (const key of Object.keys(LIFECYCLE_STATE_TYPES)) {
    options.push({
      value: key,
      label: __(LIFECYCLE_STATE_TYPES[key])
    });
  }

  return options;
};

export { hasAnyActivity, leadStatusChoices, lifecycleStateChoices };
