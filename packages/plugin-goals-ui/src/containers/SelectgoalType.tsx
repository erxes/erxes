import { SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';

import { queries } from '../graphql';
import { IGoal } from '../types';

// get goal options for react-select-plus
export function generateGoalTypeOptions(array: IGoal[] = []): IOption[] {
  return array.map(item => {
    const goal = item || ({} as IGoal);

    return {
      value: goal._id,
      label: `${goal.entity || ''}`
    };
  });
}

export default ({
  queryParams,
  onSelect,
  value,
  multi = true,
  label,
  name
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label={label}
      queryName="goalTypes"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateGoalTypeOptions}
      onSelect={onSelect}
      customQuery={queries.goalTypes}
      multi={multi}
    />
  );
};
