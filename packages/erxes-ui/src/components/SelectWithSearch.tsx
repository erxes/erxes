import * as compose from 'lodash.flowright';

import { __, confirm, readFile, withProps } from '../utils';

import { IOption } from '../types';
import Icon from './Icon';
import React from 'react';
import Select from 'react-select-plus';
import colors from '../styles/colors';
import debounce from 'lodash/debounce';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import styled from 'styled-components';

export const SelectValue = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: -7px;
  padding-left: 25px;

  img {
    position: absolute;
    left: 0;
  }
`;

const SelectOption = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const Avatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background: ${colors.bgActive};
  object-fit: cover;
  float: left;
  margin-right: 5px;
`;

const SelectWrapper = styled.div`
  position: relative;

  .Select-clear-zone {
    visibility: hidden;
  }
`;

const ClearButton = styled.div`
  position: absolute;
  right: 18px;
  font-size: 16px;
  top: 50%;
  width: 18px;
  z-index: 2;
  color: #999;
  line-height: 24px;
  margin-top: -14px;

  &:hover {
    color: #ea475d;
    cursor: pointer;
  }
`;

type Props = {
  initialValues: string[];
  searchValue: string;
  search: (search: string, loadMore?: boolean) => void;
  abortController;
} & WrapperProps;

const content = (option: IOption): React.ReactNode => (
  <>
    <Avatar
      src={
        option.avatar ? readFile(option.avatar) : '/images/avatar-colored.svg'
      }
    />
    {option.label}
  </>
);

export const selectItemRenderer = (
  option: IOption,
  showAvatar: boolean,
  OptionWrapper
): React.ReactNode => {
  if (!showAvatar) {
    return option.label;
  }

  return <OptionWrapper>{content(option)}</OptionWrapper>;
};

class SelectWithSearch extends React.Component<
  Props,
  {
    totalOptions?: IOption[];
    selectedOptions?: IOption[];
    selectedValues: string[];
    searchValue: string;
  }
> {
  private timer: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedValues: props.initialValues,
      searchValue: '',
      selectedOptions: undefined,
      totalOptions: undefined
    };

    this.timer = 0;
  }

  componentWillReceiveProps(nextProps: Props) {
    const { queryName, customQuery, generateOptions } = nextProps;
    const { selectedValues } = this.state;

    if (customQuery.loading !== this.props.customQuery.loading) {
      const datas = customQuery[queryName] || [];

      const totalOptions = this.state.totalOptions || ([] as IOption[]);
      const totalOptionsValues = totalOptions.map(option => option.value);

      const uniqueLoadedOptions = generateOptions(
        datas.filter(data => !totalOptionsValues.includes(data._id))
      );
      const updatedTotalOptions = [...totalOptions, ...uniqueLoadedOptions];

      const selectedOptions = updatedTotalOptions.filter(option =>
        selectedValues.includes(option.value)
      );

      this.setState({
        totalOptions: updatedTotalOptions,
        selectedOptions
      });
    }
  }

  renderClearButton = () => {
    if (!this.props.multi) {
      return null;
    }

    const { selectedValues = [] } = this.state;

    if (selectedValues.length > 0) {
      return (
        <ClearButton onClick={this.onClear}>
          <Icon icon="times" />
        </ClearButton>
      );
    }

    return null;
  };

  onClear = e => {
    confirm().then(() => {
      this.props.onSelect([], this.props.name);
      this.setState({ selectedValues: [], selectedOptions: [] });
    });
  };

  render() {
    const {
      customQuery,
      label,
      onSelect,
      name,
      search,
      multi,
      customOption,
      showAvatar = true
    } = this.props;

    const { totalOptions, selectedValues } = this.state;

    const selectMultiple = (ops: IOption[]) => {
      const selectedOptionsValues = ops.map(option => option.value);

      onSelect(selectedOptionsValues, name);

      this.setState({
        selectedValues: selectedOptionsValues,
        selectedOptions: [...ops]
      });
    };

    const selectSingle = (option: IOption) => {
      const selectedOptionValue = option ? option.value : '';

      onSelect(selectedOptionValue, name, option?.extraValue);

      this.setState({
        selectedValues: [selectedOptionValue],
        selectedOptions: [{ ...option }]
      });
    };

    const onChange = multi ? selectMultiple : selectSingle;

    const onSearch = (searchValue: string) => {
      this.setState({ searchValue });

      clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        search(searchValue);
      }, 1000);
    };

    const onOpen = () => search('reload');

    const selectOptions = [...(totalOptions || [])];

    if (customOption) {
      selectOptions.unshift(customOption);
    }

    let optionRenderer;
    let valueRenderer;

    if (multi) {
      valueRenderer = (option: IOption) =>
        selectItemRenderer(option, showAvatar, SelectValue);

      optionRenderer = (option: IOption) =>
        selectItemRenderer(option, showAvatar, SelectOption);
    }

    return (
      <SelectWrapper>
        <Select
          placeholder={__(label)}
          value={multi ? selectedValues : selectedValues[0]}
          loadingPlaceholder={__('Loading...')}
          isLoading={customQuery.loading}
          onOpen={onOpen}
          onChange={onChange}
          optionRenderer={optionRenderer}
          valueRenderer={valueRenderer}
          onInputChange={onSearch}
          options={selectOptions}
          multi={multi}
        />
        {this.renderClearButton()}
      </SelectWrapper>
    );
  }
}

const withQuery = ({ customQuery }) =>
  withProps<Props>(
    compose(
      graphql<
        Props,
        {},
        { searchValue?: string; ids?: string[]; filterParams?: any }
      >(gql(customQuery), {
        name: 'customQuery',
        options: ({
          searchValue,
          filterParams,
          initialValues,
          abortController
        }) => {
          const context = { fetchOptions: { signal: abortController.signal } };

          if (searchValue === 'reload') {
            return {
              context,
              variables: {
                ids: initialValues,
                excludeIds: true,
                ...filterParams
              },
              fetchPolicy: 'network-only',
              notifyOnNetworkStatusChange: true
            };
          }

          if (searchValue) {
            return { context, variables: { searchValue, ...filterParams } };
          }

          return {
            context,
            fetchPolicy: 'network-only',
            variables: {
              ids: initialValues,
              ...filterParams
            }
          };
        }
      })
    )(SelectWithSearch)
  );

type IInitialValue = string | string[] | undefined;

type WrapperProps = {
  initialValue: IInitialValue;

  queryName: string;
  name: string;
  label: string;
  onSelect: (
    values: string[] | string,
    name: string,
    extraValue?: string
  ) => void;
  generateOptions: (datas: any[]) => IOption[];
  customQuery?: any;
  multi?: boolean;
  filterParams?: any;
  showAvatar?: boolean;
  customOption?: {
    value: string;
    label: string;
    avatar?: string;
  };
};

class Wrapper extends React.Component<
  WrapperProps,
  { searchValue: string; abortController },
  { WithQuery: React.ReactNode }
> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery({ customQuery: this.props.customQuery });

    this.state = { searchValue: '', abortController: new AbortController() };
  }

  search = (searchValue: string) => {
    const { abortController } = this.state;

    if (abortController) {
      abortController.abort();
    }

    this.setState({ searchValue, abortController: new AbortController() });
  };

  render() {
    const { searchValue, abortController } = this.state;
    const { initialValue } = this.props;

    const Component = this.withQuery;

    let initialValues: string[] = [];

    if (initialValue) {
      initialValues =
        typeof initialValue === 'string' ? [initialValue] : initialValue;
    }

    return (
      <Component
        {...this.props}
        initialValues={initialValues}
        abortController={abortController}
        search={this.search}
        searchValue={searchValue}
      />
    );
  }
}

export default Wrapper;
