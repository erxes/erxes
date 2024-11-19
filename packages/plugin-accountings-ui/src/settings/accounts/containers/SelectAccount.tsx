import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { IAccount } from '../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../graphql';

// get config options for react-select
export function generateAccountOptions(
  array: IAccount[] = []
): IOption[] {
  return array.map(item => {
    const account = item || ({} as IAccount);

    let space = '';

    return {
      value: account._id,
      label: `${space}${account.code} - ${account.name}`,
      obj: account
    };
  });
}

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = false,
  customOption,
  label,
  name,
  filterParams,
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, obj?: IAccount, name?: string, extraValue?: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  filterParams?: {
    ids?: string[];
    status?: string;
    searchValue?: string;
    withoutUserFilter?: boolean;
    journals?: string[];
    kind?: string;
  };
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const onSelected = (id: string[] | string, name: string, extraValue?: string, obj?: any) => {
    onSelect(id, obj, name, extraValue);
  }

  return (
    <SelectWithSearch
      showAvatar={false}
      label={label}
      queryName="accounts"
      name={name}
      customQuery={queries.accounts}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateAccountOptions}
      onSelect={onSelected}
      multi={multi}
      customOption={customOption}
    />
  );
};
