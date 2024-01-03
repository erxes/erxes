import React from 'react';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '@erxes/ui-knowledgebase/src/graphql';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';

const SelectKbCategory = ({
  label,
  name,
  queryParams,
  initialValue,
  multi,
  customOption,
  onSelect
}: {
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
}) => {
  const { data, loading } = useQuery(gql(queries.knowledgeBaseTopics));

  if (loading) {
    return <Spinner objective />;
  }

  const { knowledgeBaseTopics = [] } = data;

  const topicIds = knowledgeBaseTopics.map(topic => topic._id);

  const defaultValue = queryParams ? queryParams[name] : initialValue;

  const generateOptions = (array: any[] = []): IOption[] => {
    return array
      .filter(item => item?.parentCategoryId)
      .map(item => ({ label: item.title, value: item._id }));
  };

  return (
    <SelectWithSearch
      label={label || 'select knowledgebase category'}
      queryName="knowledgeBaseCategories"
      name={name}
      filterParams={{
        topicIds
      }}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customQuery={queries.knowledgeBaseCategories}
      customOption={customOption}
      multi={multi}
    />
  );
};

export default SelectKbCategory;
