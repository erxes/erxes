import client from 'apolloClient';
import gql from 'graphql-tag';
import debounce from 'lodash/debounce';
import React, { useEffect, useState } from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { __, Alert } from '../utils';
import Button from './Button';
import Icon from './Icon';

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
  const onClick = e => onSelect(option, e);
  const onRemoveClick = () => onRemove(option.value);

  return (
    <OptionWrapper onClick={onClick}>
      <FillContent>{option.label}</FillContent>
      <Icon
        style={{ float: 'right' }}
        onClick={onRemoveClick}
        icon="times-circle"
      />
    </OptionWrapper>
  );
}

type Option = {
  label: string;
  value: string;
  onRemove?: (value: string) => void;
};

type Props = {
  name: string;
  placeholder?: string;
  queryName: string;
  customQuery: string;
  selector: Option;
};

type Field = {
  search: { label: string, options: Option[] };
  added: { label: string, options: Option[] };
};

type SelectOptions = Array<{ label: string, options: Option[] }>;

function generateOptions(options: any = [], selector: Option) {
  if (options.length === 0) {
    return [];
  }

  return options.map(option => ({
    label: option[selector.label],
    value: option[selector.value]
  }));
};

const defaultFieldValues = {
  search: {
    label: 'Search',
    options: []
  },
  added: {
    label: 'Added',
    options: []
  }
};

function SelectWithCreate({
 placeholder,
 queryName,
 customQuery,
 name,
 selector 
}: Props) {
  const [fields, setFields] = useState<Field>(defaultFieldValues);
  const [selectOptions, setSelectOptions] = useState<SelectOptions>([]);
  const [selectedValue, setSelectedValue] = useState<Option | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    const updatedOptions = [fields.search, fields.added];

    setSelectOptions(updatedOptions);
  }, [fields]);

  useEffect(() => {
    const fetch = () => {
      if (searchValue.length === 0) {
        return;
      }

      return client.query({
        query: gql(customQuery),
        variables: { searchValue },
      })
        .then(({ data }) => {
          const list = data[queryName];

          const currentFields = {...fields};

          currentFields.search.options = generateOptions(list, selector);

          setFields(currentFields);
        });
    };

    debounce(() => fetch())();

  }, [searchValue]);

  const handleChange = (option) => {
    setSearchValue('');
    setSelectedValue(option);
  };

  const handleInput = (input: string) => {
    return setSearchValue(input);
  };

  const handleAdd = () => {
    const currentFields = {...fields};
    const { options } = currentFields.added;

    const foundIndex = options.findIndex(option => option.label === searchValue);

    if (foundIndex !== -1) {
      return Alert.error('Already exist');
    }

    Alert.success('Name added');

    options.push({
      label: searchValue,
      value: searchValue,
      onRemove: handleRemove
    })

    setSearchValue('');
    setFields(currentFields);
  };

  const handleRemove = (value: string) => {
    const currentFields = {...fields};
    const { options } = currentFields.added;

    const filteredOptions = options.filter(option => option.value !== value);

    currentFields.added.options = filteredOptions;

    setSearchValue('');
    setSelectedValue(null);
    setFields(currentFields);
  };

  return (
    <Wrapper>
      <FillContent>
        <Select
          placeholder={placeholder}
          value={selectedValue}
          options={selectOptions}
          clearable={true}
          onChange={handleChange}
          onBlurResetsInput={false}
          onSelectResetsInput={true}
          onInputChange={handleInput}
          optionComponent={Option}
        />
      </FillContent>
      {(
        <Button
          size="small"
          btnStyle="primary"
          uppercase={false}
          onClick={handleAdd}
          icon="plus-circle"
        >
          {`${__('Add')} ${__(name)}`}
        </Button>
      )}
    </Wrapper>
  );
}

export default SelectWithCreate