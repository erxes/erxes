import React from 'react';
import { EmptyState, SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';

type Props = {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (
    value: string[] | string,
    name: string,
    assetName?: string
  ) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  filterParams?: any;
};

export function SelectAccount({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  onSelect,
  filterParams
}: Props) {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateOptions = (array: any[] = []): IOption[] => {
    return array.map(item => ({
      label: item.name,
      extraValue: item.name,
      value: item._id
    }));
  };

  return (
    <SelectWithSearch
      label={label}
      queryName="facebookGetAccounts"
      filterParams={{ ...filterParams, kind: 'facebook' }}
      name={name}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customQuery={queries.facebookGetAccounts}
      customOption={customOption}
      multi={multi}
    />
  );
}

export function SelectAccountPages({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  onSelect,
  filterParams,
  accountId
}: { accountId: string } & Props) {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateOptions = (array: any[] = []): IOption[] => {
    return array.map(item => ({
      label: item.name,
      extraValue: item.name,
      value: item.id
    }));
  };

  if (!accountId) {
    return (
      <EmptyState
        icon="facebook"
        text="Please select a integrated facebook account"
      />
    );
  }

  return (
    <SelectWithSearch
      label={label}
      queryName="facebookGetPages"
      filterParams={{
        ...filterParams,
        accountId,
        kind: 'facebook-messenger'
      }}
      name={name}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customQuery={queries.facebookGetPages}
      customOption={customOption}
      multi={multi}
    />
  );
}
