import { IOption, IQueryParams } from '@erxes/ui/src/types';

import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import queries from '../../pos/graphql/queries';
import { IPos } from '../../types';

function generatePosOptions(array: IPos[] = []): IOption[] {
  return array.map(item => {
    const pos = item || ({} as IPos);
    return {
      value: pos._id,
      label: pos.name || 'NaN'
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
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="posList"
      name={name}
      initialValue={defaultValue}
      generateOptions={generatePosOptions}
      onSelect={onSelect}
      customQuery={queries.posList}
      customOption={customOption}
      multi={multi}
    />
  );
};
