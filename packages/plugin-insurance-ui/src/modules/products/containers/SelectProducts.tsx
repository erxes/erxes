import React from 'react';

import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';

import { getGqlString } from '@erxes/ui/src/utils/core';
import { InsuranceProduct } from '../../../gql/types';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';

// get config options for react-select-plus
export function generateOptions(array: InsuranceProduct[] = []): IOption[] {
  return array.map(item => {
    const prod = item || ({} as InsuranceProduct);

    return {
      value: prod._id,
      label: prod.name || ''
    };
  });
}

const SelectProducts = ({
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
  onSelect: (values: string[] | string) => void;
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
      queryName="insuranceProducts"
      name={name}
      customQuery={getGqlString(queries.GET_PRODUCTS)}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
    />
  );
};

export default SelectProducts;
