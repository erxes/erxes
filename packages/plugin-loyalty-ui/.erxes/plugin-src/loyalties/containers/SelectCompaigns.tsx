import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

function generateOptions(array: { _id: string, title: string }[] = []): IOption[] {
  return array.map(item => {
    const compaign = item || ({} as { _id: string, title: string });

    return {
      value: compaign._id,
      label: compaign.title
    };
  });
}

export default ({
  queryName,
  customQuery,
  filterParams,
  queryParams,
  onSelect,
  initialValue,
  multi = false,
  customOption,
  label,
  name
}: {
  queryName: string;
  customQuery: string;
  filterParams?: IQueryParams;
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName={queryName}
      name={name}
      customQuery={customQuery}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customOption={customOption}
      multi={multi}
      filterParams={filterParams}
    />
  );
};
