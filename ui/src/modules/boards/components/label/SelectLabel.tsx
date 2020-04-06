import SelectWithSearch from 'modules/common/components/SelectWithSearch';
import { IOption, IQueryParams } from 'modules/common/types';
import React from 'react';
import { queries } from '../../graphql/index';
import { IPipelineLabel } from '../../types';

// get user options for react-select-plus
export function generateLabelOptions(array: IPipelineLabel[] = []): IOption[] {
  return array.map(item => {
    const label = item || ({} as IPipelineLabel);

    return {
      value: label._id || '',
      label: label.name
    };
  });
}

type ISelectParams = {
  queryParams?: IQueryParams;
  filterParams?: { pipelineId: string };
  onSelect: (value: string[] | string, name: string) => void;
  multi?: boolean;
  customOption?: IOption;
  value?: string | string[];
  name: string;
};

export default ({
  queryParams,
  value,
  name,
  filterParams,
  onSelect,
  customOption,
  multi
}: ISelectParams) => {
  const defaultValue = queryParams ? queryParams[name] : value;

  return (
    <SelectWithSearch
      label="Filter by labels"
      queryName="pipelineLabels"
      name={name}
      filterParams={filterParams}
      values={
        typeof defaultValue === 'string'
          ? multi
            ? [defaultValue]
            : defaultValue
          : defaultValue
      }
      generateOptions={generateLabelOptions}
      onSelect={onSelect}
      customQuery={queries.pipelineLabels}
      customOption={customOption}
      multi={multi}
      showAvatar={false}
    />
  );
};
