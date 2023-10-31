import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';

import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import { ISPLabel } from '../types';

// get user options for react-select-plus
export function generateUserOptions(array: ISPLabel[] = []): IOption[] {
  return array.map(item => {
    const spLabel = item || ({} as ISPLabel);

    return {
      value: spLabel._id || '',
      label: `${spLabel.title} (${spLabel.effect})`
    };
  });
}

export default (props: {
  queryParams?: IQueryParams;
  filterParams?: { status: string };
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
}) => {
  const {
    queryParams,
    onSelect,
    customOption,
    initialValue,
    multi = true,
    label,
    filterParams,
    name
  } = props;
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="spLabels"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateUserOptions}
      onSelect={onSelect}
      customQuery={queries.spLabels}
      customOption={customOption}
      multi={multi}
    />
  );
};
