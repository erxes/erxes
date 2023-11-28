import { IOption, IQueryParams } from '@erxes/ui/src/types';

import React, { useEffect, useState } from 'react';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IDeal } from '@erxes/ui-cards/src/deals/types';
import queries from '../../../graphql/queries';

function generateDealOptions(array: IDeal[] = []): IOption[] {
  return array.map(item => {
    const deal = item || ({} as IDeal);
    return {
      value: deal._id,
      label: deal.name
    };
  });
}

type Props = {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  filterParams?: any;
};

const SelectDeal = (props: Props) => {
  const {
    queryParams,
    label,
    onSelect,
    multi = true,
    customOption,
    initialValue,
    name,
    filterParams
  } = props;
  const defaultValue = queryParams ? queryParams[name] : initialValue;
  const abortController = new AbortController();

  const [filter, setFilter] = useState(filterParams);

  useEffect(() => {
    setFilter(filterParams);
  }, [filterParams]);

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
      filterParams={filter}
    />
  );
};

export default SelectDeal;
