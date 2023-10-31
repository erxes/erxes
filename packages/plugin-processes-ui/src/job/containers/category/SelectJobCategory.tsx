import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { IJobCategory } from '../../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../../graphql';

// get config options for react-select-plus
export function generateProductOptions(array: IJobCategory[] = []): IOption[] {
  return array.map(item => {
    const category = item || ({} as IJobCategory);

    const foundedString = category.order.match(/[/]/gi);

    let space = '';

    if (foundedString) {
      space = '\u00A0 \u00A0'.repeat(foundedString.length);
    }

    return {
      value: category._id,
      label: `${space}${category.code} - ${category.name}`
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  label,
  name,
  customOption
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  setParam?: boolean;
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="jobCategories"
      customOption={customOption}
      name={name}
      customQuery={queries.jobCategories}
      initialValue={defaultValue}
      generateOptions={generateProductOptions}
      onSelect={onSelect}
      multi={multi}
    />
  );
};
