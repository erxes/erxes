import React, { useState } from 'react';
import {
  EmptyState,
  FormControl,
  SelectWithSearch,
  Spinner
} from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { queries } from '../graphql';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Box } from '@erxes/ui-contacts/src/customers/styles';
import { PagesContainer } from './styles';

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
  initialValue,
  filterParams,
  accountId,
  onSelect
}: {
  accountId: string;
  initialValue: string;
  filterParams?: any;
  onSelect: (value: string, name: string) => void;
}) {
  const { error, loading, data } = useQuery(gql(queries.facebookGetPages), {
    variables: {
      ...filterParams,
      accountId,
      kind: 'facebook-messenger'
    },
    skip: !accountId
  });

  if (error) {
    return <EmptyState icon="info-circle" text={error.message} />;
  }

  if (loading) {
    return <Spinner objective />;
  }

  const pages = data?.facebookGetPages || [];

  const handleSelectPage = pageId => {
    if (initialValue === pageId) {
      return onSelect('', 'pageId');
    }

    onSelect(pageId, 'pageId');
  };

  return (
    <PagesContainer>
      {pages.map(({ id, name }) => (
        <Box key={id}>
          <FormControl
            componentClass="checkbox"
            onChange={() => handleSelectPage(id)}
            checked={initialValue === id}
          />
          {name}
        </Box>
      ))}
    </PagesContainer>
  );
}
