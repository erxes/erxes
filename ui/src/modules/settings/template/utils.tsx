import { generateCategoryOptions } from 'erxes-ui/lib/utils';
import { TEMPLATE_STATUS_CHOISES } from './constants';

export { generateCategoryOptions };

export const templateStatusChoises = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(TEMPLATE_STATUS_CHOISES)) {
    options.push({
      value: key,
      label: __(TEMPLATE_STATUS_CHOISES[key])
    });
  }

  return options;
};
