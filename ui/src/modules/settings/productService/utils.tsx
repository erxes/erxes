import { generateCategoryOptions } from 'erxes-ui/lib/utils';
import { PRODUCT_TYPE_CHOISES, PRODUCT_CATEGORIES_STATUS_FILTER } from './constants';

export { generateCategoryOptions };

export const productTypeChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(PRODUCT_TYPE_CHOISES)) {
    options.push({
      value: key,
      label: __(PRODUCT_TYPE_CHOISES[key])
    });
  }

  return options;
};

export const categoryStatusChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(PRODUCT_CATEGORIES_STATUS_FILTER)) {
    options.push({
      value: key,
      label: __(PRODUCT_CATEGORIES_STATUS_FILTER[key])
    });
  }

  return options;
};
