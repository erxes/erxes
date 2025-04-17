import {
  ControlLabel,
  FormControl,
  FormGroup
} from "@erxes/ui/src/components/form";

import { Attributes } from "../styles";
import { IOption } from "@erxes/ui/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import Popover from "@erxes/ui/src/components/Popover";
import React, { useRef, useState } from "react";
import { __ } from "@erxes/ui/src/utils/core";
import { gql, useQuery } from "@apollo/client";

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
  options: IOption[];
  isMulti?: boolean;
  selectConfig?: any;
};

type State = {
  searchValue: string;
};

const generateOptions = (searchValue, selectionConfig, options) => {
  if (selectionConfig) {
    const {
      queryName,
      selectionName,
      labelField,
      valueField = "_id",
      multi
    } = selectionConfig;

    const query = `
        query ${queryName}($searchValue: String) {
          ${queryName}(searchValue: $searchValue) {
            ${labelField},${valueField}
          }
        }
      `;
    const { data, loading } = useQuery(gql(query), {
      variables: { searchValue }
    });

    if (loading) {
      return [];
    }

    const options = data[queryName].map((option) => ({
      label: option[labelField],
      value: option[valueField]
    }));

    return options;
  }

  return searchValue
    ? options.filter((option) =>
        new RegExp(searchValue, "i").test(option.label)
      )
    : options;
};

const SelectOption: React.FC<Props> = ({
  config,
  setConfig,
  inputName = "value",
  isMulti,
  options: initialOptions,
  selectConfig
}) => {
  const overlay = useRef(null);
  const [searchValue, setSearchValue] = useState("");

  const onChange = (item, close) => {
    const updatedConfig = { ...config };

    if (isMulti) {
      const value: string = updatedConfig[inputName] || "";
      const re = /(\[\[ \w* \]\])/gi;
      const ids: string[] = value.match(re) || [];

      if (!ids.includes(`[[ ${item.value} ]]`)) {
        const comma = value ? ", " : "";
        updatedConfig[inputName] = `${value}${comma}[[ ${item.value} ]]`;
      }
    } else {
      updatedConfig[inputName] = `[[ ${item.value} ]]`;
    }

    setConfig(updatedConfig);
    close();
  };

  const onSearch = (e: React.FormEvent<HTMLElement>) => {
    const { value } = e.currentTarget as HTMLInputElement;

    setSearchValue(value);
  };

  const filteredOptions = generateOptions(
    searchValue,
    selectConfig,
    initialOptions
  );

  const lists = (close) => (
    <Attributes>
      <>
        <FormGroup>
          <ControlLabel>{__("Search")}</ControlLabel>
          <FormControl placeholder="Type to search" onChange={onSearch} />
        </FormGroup>
        <li>
          <b>Default Options</b>
        </li>
        {filteredOptions.map((item) => (
          <li key={item.label} onClick={() => onChange(item, close)}>
            {item.label}
          </li>
        ))}
      </>
    </Attributes>
  );

  return (
    <Popover
      innerRef={overlay}
      trigger={
        <span>
          {__("Options")} <Icon icon="angle-down" />
        </span>
      }
      placement="top"
      closeAfterSelect={true}
    >
      {lists}
    </Popover>
  );
};
export default SelectOption;
