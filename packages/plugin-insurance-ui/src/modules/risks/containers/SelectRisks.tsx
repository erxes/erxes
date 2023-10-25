import React from 'react';

import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';

import { getGqlString } from '@erxes/ui/src/utils/core';
import { Risk } from '../../../gql/graphql';

// get config options for react-select-plus
export function generateOptions(array: Risk[] = []): IOption[] {
  return array.map(item => {
    const risk = item || ({} as Risk);

    return {
      value: risk._id,
      label: `${risk.code} - ${risk.name}`
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
      queryName="risks"
      name={name}
      customQuery={getGqlString(queries.RISKS)}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      multi={multi}
      customOption={customOption}
    />
  );
};
