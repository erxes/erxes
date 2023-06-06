import { queries } from '@erxes/ui-cards/src/boards/graphql';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

function generateCustomerOptions(array: any[] = []): IOption[] {
  return array.map(item => {
    return {
      value: item._id,
      label: item.name
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  customOption,
  label,
  name,
  type
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  type: 'deal' | 'ticket' | 'task' | 'purchase';
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName={`${type}s`}
      customQuery={queries[`${type}s`]}
      name={name}
      initialValue={defaultValue}
      generateOptions={generateCustomerOptions}
      onSelect={onSelect}
      customOption={customOption}
      multi={multi}
    />
  );
};
