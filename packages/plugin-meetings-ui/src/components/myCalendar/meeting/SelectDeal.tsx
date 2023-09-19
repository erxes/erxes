import { IOption, IQueryParams } from '@erxes/ui/src/types';

import React from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '@erxes/ui-cards/src/deals/graphql';
import { IDeal } from '@erxes/ui-cards/src/deals/types';

function generateDealOptions(array: IDeal[] = []): IOption[] {
  return array.map(item => {
    const deal = item || ({} as IDeal);
    return {
      value: deal._id,
      label: deal.name
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
      queryName="deals"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateDealOptions}
      onSelect={onSelect}
      customQuery={queries.deals}
      customOption={customOption}
      multi={multi}
    />
  );
};
