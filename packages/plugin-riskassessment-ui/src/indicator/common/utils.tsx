import { ITag } from '@erxes/ui-tags/src/types';
import { router, SelectWithSearch } from '@erxes/ui/src';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import React from 'react';
import { tags as tagsQuery } from '../../common/graphql';
import { generateParamsIds } from '../../common/utils';
import { queries } from '../graphql';

export const generateParams = ({ queryParams }) => {
  return {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    sortFromDate: queryParams.from || undefined,
    sortToDate: queryParams.to || undefined,
    tagIds: generateParamsIds(queryParams?.tagIds || [])
  };
};

export const refetchQueries = queryParams => [
  {
    query: gql(queries.list),
    variables: {
      ...generateParams({ queryParams })
    }
  },
  {
    query: gql(queries.totalCount),
    variables: {
      ...generateParams({ queryParams })
    }
  }
];

export const SelectTags = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  ignoreIds,
  onSelect
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  ignoreIds?: string[];
}) => {
  function generetaOption(array: ITag[] = []): IOption[] {
    let list: any[] = [];

    list = array.map(item => ({ value: item._id, label: item.name }));

    if (ignoreIds) {
      list = list.filter(item => !ignoreIds.includes(item.value));
    }

    return list;
  }
  return (
    <SelectWithSearch
      label={label}
      queryName="tags"
      name={name}
      initialValue={initialValue}
      generateOptions={generetaOption}
      onSelect={onSelect}
      customQuery={tagsQuery}
      customOption={
        customOption ? customOption : { value: '', label: 'Choose a Tag' }
      }
      filterParams={{ type: 'riskassessment:riskassessment' }}
      multi={multi}
    />
  );
};
