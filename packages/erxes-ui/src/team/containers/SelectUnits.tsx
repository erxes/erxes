import SelectWithSearch from '../../components/SelectWithSearch';
import { IOption, IQueryParams } from '../../types';
import React from 'react';
import { units } from '../graphql';
import { IUnit } from '@erxes/ui-team/src/types';

// get user options for react-select-plus
export function generateUserOptions(array: IUnit[] = []): IOption[] {
  return array.map(item => {
    const unit = item || ({} as IUnit);

    return {
      value: unit._id,
      label: `${unit.title} (${unit.code})`
    };
  });
}

export default (props: {
  queryParams?: IQueryParams;
  filterParams?: { status: string };
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
}) => {
  const {
    queryParams,
    onSelect,
    customOption,
    initialValue,
    multi = true,
    label,
    filterParams,
    name
  } = props;
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label={label}
      queryName="units"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateUserOptions}
      onSelect={onSelect}
      customQuery={units}
      customOption={customOption}
      multi={multi}
    />
  );
};
