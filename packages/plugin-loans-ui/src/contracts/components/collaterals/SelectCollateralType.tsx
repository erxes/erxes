import { IOption, IQueryParams } from '@erxes/ui/src/types';

import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';

import queries from '../../../collaterals/graphql/queries';
import { IContract } from '../../types';
import {  ICollateralTypeDocument } from '../../../collaterals/types';

function generateCustomerOptions(array: ICollateralTypeDocument[] = []): IOption[] {
  return array.map(item => {
    const contract = item || ({} as IContract);
    CollateralType[contract._id] = contract;
    return {
      value: contract._id,
      label: `${contract.code} ${contract.name}`
    };
  });
}

export const CollateralType = {};

export default ({
  queryParams,
  onSelect,
  initialValue,
  multi = true,
  customOption,
  label,
  name,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  filterParams?: any;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="collateralTypes"
      name={name}
      customQuery={queries.collateralTypes}
      initialValue={defaultValue}
      generateOptions={generateCustomerOptions}
      onSelect={onSelect}
      filterParams={filterParams}
      customOption={customOption}
      multi={multi}
    />
  );
};
