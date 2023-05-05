import { SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import React from 'react';
import { queries } from '../../section/graphql';

export function SelectActions({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  ignoreIds,
  onSelect,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  initialValue?: string | string[];
  name: string;
  ignoreIds?: string[];
  filterParams?: {
    branchIds?: string[];
    departmentIds?: string[];
    operationIds?: string[];
  };
}) {
  function generetaOption(
    array: { label: string; action: string }[] = []
  ): IOption[] {
    let list: any[] = [];

    list = array.map(item => ({ value: item.action, label: item.label }));

    if (ignoreIds) {
      list = list.filter(item => !ignoreIds.includes(item.value));
    }

    return list;
  }

  return (
    <SelectWithSearch
      label={label}
      queryName="getGrantRequestActions"
      name={name}
      initialValue={initialValue}
      generateOptions={generetaOption}
      onSelect={onSelect}
      customQuery={queries.grantActions}
      filterParams={filterParams}
      multi={multi}
    />
  );
}
