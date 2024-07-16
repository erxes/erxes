import React from 'react';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { queries } from '@erxes/ui-knowledgebase/src/graphql';

const SelectKbTopics = ({
  label,
  name,
  queryParams,
  initialValue,
  value,
  multi,
  customOption,
  onSelect
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  value?: string;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value || initialValue;

  const generateOptions = (array: any[] = []): IOption[] => {
    return array.map((item) => ({ label: item.title, value: item._id }));
  };

  return (
    <SelectWithSearch
      label={label || 'select knowledgebase topic'}
      queryName="knowledgeBaseTopics"
      name={name}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customQuery={queries.knowledgeBaseTopics}
      customOption={customOption}
      multi={multi}
    />
  );
};

export default SelectKbTopics;
