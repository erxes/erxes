import { queries } from '@erxes/ui-knowledgebase/src/graphql';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';
import { IOption, IQueryParams } from '@erxes/ui/src/types';
import { generateTree } from '@erxes/ui/src/utils/core';
import React from 'react';

const SelectKbCategories = ({
  label,
  name,
  queryParams,
  initialValue,
  value,
  multi,
  customOption,
  onSelect,
  filterParams
}: {
  queryParams?: IQueryParams;
  label: string;
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  initialValue?: string | string[];
  name: string;
  value?: string;
  filterParams: any;
}) => {
  const defaultValue = queryParams ? queryParams[name] : value || initialValue;

  const generateOptions = (array: any[] = []): IOption[] => {
    const generateList = () => {
      const list = array.map((item) => {
        if (!array.find((dep) => dep._id === item.parentCategoryId)) {
          return { ...item, parentCategoryId: null };
        }
        return item;
      });
      return list;
    };
    return generateTree(
      generateList(),
      null,
      (node, level) => ({
        value: node._id,
        label: `${'\u00A0 \u00A0 '.repeat(level)}  ${node.title}`
      }),
      undefined,
      'parentCategoryId'
    );
  };

  return (
    <SelectWithSearch
      label={label || 'select knowledgebase category'}
      queryName="knowledgeBaseCategories"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateOptions}
      onSelect={onSelect}
      customQuery={queries.knowledgeBaseCategories}
      customOption={customOption}
      multi={multi}
    />
  );
};

export default SelectKbCategories;
