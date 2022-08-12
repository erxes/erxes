import React from 'react';
import { queries } from '../../graphql';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { ISiteDoc } from '../../types';

export function generateSiteOptions(array: ISiteDoc[] = []): IOption[] {
  return array.map(item => {
    const site = item || {};

    return {
      value: site._id,
      label: site.name
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
      queryName="webbuilderSites"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateSiteOptions}
      onSelect={onSelect}
      customQuery={queries.sites}
      customOption={customOption}
      multi={multi}
    />
  );
};
