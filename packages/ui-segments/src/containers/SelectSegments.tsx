import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import { ISegment } from '../types';

// get config options for react-select-plus
export function generateSegmentOptions(array: ISegment[] = []): IOption[] {
  return array.map(item => {
    const segment = item || ({} as ISegment);

    return {
      value: segment._id,
      label: `${segment.name}`
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
  contentTypes,
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
  contentTypes: string[];
  filterParams?: any;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="segments"
      name={name}
      customOption={customOption}
      customQuery={queries.segments}
      initialValue={defaultValue}
      generateOptions={generateSegmentOptions}
      onSelect={onSelect}
      multi={multi}
      filterParams={{ ...filterParams, contentTypes }}
    />
  );
};
