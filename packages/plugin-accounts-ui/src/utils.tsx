import { generateCategoryOptions } from '@erxes/ui/src/utils';
import { ACCOUNT_CATEGORIES_STATUS_FILTER } from './constants';

export { generateCategoryOptions };

export const categoryStatusChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(ACCOUNT_CATEGORIES_STATUS_FILTER)) {
    options.push({
      value: key,
      label: __(ACCOUNT_CATEGORIES_STATUS_FILTER[key])
    });
  }

  return options;
};
