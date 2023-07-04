import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import { IAccount } from '../types';

// get config options for react-select-plus
export function generateAccountOptions(array: IAccount[] = []): IOption[] {
  return array.map(item => {
    const account = item || ({} as IAccount);
    return {
      value: account._id,
      label: `${account.code} - ${account.name}`
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
  name
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
      queryName="accounts"
      name={name}
      customQuery={queries.accounts}
      initialValue={defaultValue}
      generateOptions={generateAccountOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
    />
  );
};
