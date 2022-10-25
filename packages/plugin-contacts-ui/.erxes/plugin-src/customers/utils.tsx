import { LEAD_STATUS_TYPES } from '@erxes/ui-contacts/src/customers/constants';

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
