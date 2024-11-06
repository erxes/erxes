import { IOption, IQueryParams } from "@erxes/ui/src/types";

import { IPipelineLabel } from "../../types";
import React from "react";
import SelectWithSearch from "@erxes/ui/src/components/SelectWithSearch";
import { queries } from "../../graphql/index";

// get user options for react-select
export function generateLabelOptions(array: IPipelineLabel[] = []): IOption[] {
  return (array || []).map(item => {
    const label = item || ({} as IPipelineLabel);

    return {
      value: label._id || "",
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
  initialValue?: string | string[];
  name: string;
};

export default ({
  queryParams,
  initialValue,
  name,
  filterParams,
  onSelect,
  customOption,
  multi
}: ISelectParams) => {
  const defaultValue = queryParams ? queryParams[name] : initialValue;

  return (
    <SelectWithSearch
      label="Filter by labels"
      queryName="tasksPipelineLabels"
      name={name}
      filterParams={filterParams}
      initialValue={defaultValue}
      generateOptions={generateLabelOptions}
      onSelect={onSelect}
      customQuery={queries.pipelineLabels}
      customOption={customOption}
      multi={multi}
      showAvatar={false}
    />
  );
};
