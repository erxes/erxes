import client from "apolloClient";
import gql from "graphql-tag";
import debounce from "lodash/debounce";
import React, { useEffect, useState } from "react";
import Select from "react-select-plus";
import styled from "styled-components";
import { __ } from "../utils";
import Button from "./Button";
import Icon from "./Icon";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const OptionWrapper = styled(Wrapper)`
  padding: 8px 16px;
  font-weight: 500;
  border-bottom: 1px solid #eee;

  &:last-child {
    border: none;
  }

  &:hover {
    background: #fafafa;
    cursor: default;
  }

  i {
    color: #ea475d;

    &:hover {
      cursor: pointer;
    }
  }
`;

const FillContent = styled.div`
  flex: 1;
  margin-right: 5px;
`;

type OptionProps = {
  option: any;
  onSelect: (option: any[], e: any) => void;
};

function Option({ option, onSelect }: OptionProps) {
  const { onRemove } = option;
  const onClick = (e) => onSelect(option, e);
  const onRemoveClick = () => onRemove(option.value);

  if (onRemove) {
    return (
      <OptionWrapper onClick={onClick}>
        <FillContent>{option.label}</FillContent>
        <Icon
          style={{ float: "right" }}
          onClick={onRemoveClick}
          icon="times-circle"
        />
      </OptionWrapper>
    );
  }

  return (
    <OptionWrapper>
      <FillContent>{option.label}</FillContent>
      <small>(Already exist)</small>
    </OptionWrapper>
  );
}

type Option = {
  label?: string;
  value?: string;
  onRemove?: (value: string) => void;
};

type Props = {
  placeholder?: string;
  defaultValue?: string;
  options: string[];
  queryName: string;
  customQuery: string;
  selector: Option;
  onChange: (params: { options: any[]; selectedOption: any }) => void;
};

type Field = {
  search: { label: string; options: Option[] };
  added: { label: string; options: Option[] };
};

type SelectOptions = Array<{ label: string; options: Option[] }>;

function generateOptions(options: any = [], selector: any) {
  if (options.length === 0) {
    return [];
  }

  return options.map((option) => ({
    label: option[selector.label],
    value: option[selector.value],
  }));
}

function SelectWithCreate({
  placeholder,
  queryName,
  customQuery,
  selector,
  options,
  defaultValue,
  onChange,
}: Props) {
  const [fields, setFields] = useState<Field>({
    added: {
      label: "Possible names",
      options: [],
    },
    search: {
      label: "Search result",
      options: [],
    },
  });

  const [selectOptions, setSelectOptions] = useState<SelectOptions>([]);
  const [selectedValue, setSelectedValue] = useState<Option | null>(
    defaultValue ? { label: defaultValue, value: defaultValue } : null
  );
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    if (options.length > 0) {
      fields.added.options = options.map((item) => ({
        label: item,
        value: item,
        onRemove: handleRemove,
      }));
    }

    const updatedOptions = [fields.added, fields.search];

    setSelectOptions(updatedOptions);
  }, []);

  useEffect(
    () => {
      const updatedOptions = [fields.added, fields.search];

      setSelectOptions(updatedOptions);
    },
    [fields]
  );

  useEffect(
    () => {
      const fetch = () => {
        if (searchValue.length === 0) {
          return;
        }

        return client
          .query({
            query: gql(customQuery),
            variables: { searchValue, autoCompletion: true },
          })
          .then(({ data }) => {
            const list = data[queryName];

            const currentFields = { ...fields };

            currentFields.search.options = generateOptions(list, selector);

            setFields(currentFields);
          });
      };

      debounce(() => fetch(), 400)();
    },
    [searchValue]
  );

  const handleChange = (option) => {
    setSearchValue("");
    setSelectedValue(option);

    if (option) {
      const values = fields.added.options.map((item) => item.label);

      onChange({
        options: values,
        selectedOption: option.value,
      });
    }
  };

  const handleInput = (input: string) => {
    return setSearchValue(input);
  };

  const handleAdd = () => {
    const currentFields = { ...fields };
    const addedOptions = currentFields.added.options;

    addedOptions.push({
      label: searchValue,
      value: searchValue,
      onRemove: handleRemove,
    });

    setFields(currentFields);

    onChange({
      options: addedOptions.map((item) => item.label),
      selectedOption: searchValue,
    });

    setSearchValue("");
    setSelectedValue(null);
  };

  const handleRemove = (value: string) => {
    const currentFields = { ...fields };
    const addedOptions = currentFields.added.options;

    const filteredOptions = addedOptions.filter(
      (option) => option.value !== value
    );

    currentFields.added.options = filteredOptions;

    setSearchValue("");
    setSelectedValue(null);
    setFields(currentFields);

    onChange({
      options: currentFields.added.options.map((item) => item.label),
      selectedOption: null,
    });
  };

  const handleOnBlur = () => {
    const currentFields = { ...fields };

    currentFields.search.options = [];

    setFields(currentFields);
  };

  const handleKeyDown = (event) => {
    // Enter key
    if (event.keyCode === 13) {
      event.preventDefault();

      handleAdd();
    }
  };

  function renderNoResult() {
    if (searchValue.length === 0) {
      return "No results found";
    }

    return (
      <Button
        btnStyle="link"
        uppercase={false}
        onClick={handleAdd}
        block={true}
        icon="plus-circle"
      >
        Add name
      </Button>
    );
  }

  return (
    <Wrapper>
      <FillContent>
        <Select
          placeholder={placeholder}
          value={selectedValue}
          options={selectOptions}
          onSelectResetsInput={true}
          onBlur={handleOnBlur}
          onChange={handleChange}
          onInputKeyDown={handleKeyDown}
          onInputChange={handleInput}
          optionComponent={Option}
          noResultsText={renderNoResult()}
        />
      </FillContent>
    </Wrapper>
  );
}

export default SelectWithCreate;
