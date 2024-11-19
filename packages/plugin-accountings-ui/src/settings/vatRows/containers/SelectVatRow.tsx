import { IOption, IQueryParams } from '@erxes/ui/src/types';

import { IVatRow } from '../types';
import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '../graphql';

// get config options for react-select
export function generateVatRowOptions(
  array: IVatRow[] = []
): IOption[] {
  return array.map(item => {
    const vatRow = item || ({} as IVatRow);

    let space = '';

    return {
      value: vatRow._id,
      label: `${space} - ${vatRow.name}`,
      obj: vatRow
    };
  });
}

const SelectVatRow = ({
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
  onSelect: (values: string[] | string, obj?: IVatRow, name?: string, extraValue?: string) => void;
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
      queryName="vatRows"
      name={name}
      customQuery={queries.vatRows}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateVatRowOptions}
      onSelect={onSelected}
      multi={multi}
      customOption={customOption}
    />
  );
};
export default SelectVatRow;