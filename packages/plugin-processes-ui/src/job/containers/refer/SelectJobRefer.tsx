import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../../graphql';
import { IJobRefer } from '../../types';

// get config options for react-select-plus
export function generateProductOptions(array: IJobRefer[] = []): IOption[] {
  return array.map(item => {
    const jobRefer = item || ({} as IJobRefer);

    return {
      value: jobRefer._id,
      label: `${jobRefer.code} - ${jobRefer.name}`
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
  customOption,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  setParam?: boolean;
  name: string;
  filterParams?: any;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="jobRefers"
      name={name}
      customOption={customOption}
      customQuery={queries.jobRefers}
      initialValue={defaultValue}
      generateOptions={generateProductOptions}
      onSelect={onSelect}
      multi={multi}
      filterParams={filterParams}
    />
  );
};
