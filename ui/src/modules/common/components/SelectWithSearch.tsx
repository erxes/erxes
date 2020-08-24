import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import debounce from 'lodash/debounce';
import { Avatar, SelectOption, SelectValue } from 'modules/boards/styles/item';
import React from 'react';
import { graphql } from 'react-apollo';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { IOption } from '../types';
import { __, confirm, readFile, withProps } from '../utils';
import Icon from './Icon';

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
  searchValue: string;
  values: string | string[] | undefined;
  search: (search: string, loadMore?: boolean) => void;
  abortController;
} & WrapperProps;

const content = (option: IOption): React.ReactNode => (
  <>
    <Avatar src={option.avatar ? readFile(option.avatar) : '/images/avatar-colored.svg'} />
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
  { selectedOptions?: IOption[] }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedOptions: undefined
    };
  }

  componentWillUpdate(nextProps: Props) {
    const { queryName, customQuery, generateOptions, values = [] } = nextProps;

    const datas = customQuery[queryName] || [];
    const loading = customQuery.loading;

    if (!this.state.selectedOptions && !loading) {
      this.setState({
        selectedOptions: generateOptions(
          datas.filter(data => values.includes(data._id))
        )
      });
    }
  }

  renderClearButton = () => {
    if (!this.props.multi) {
      return null;
    }

    const { values = [] } = this.props;
    if (values.length > 0) {
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
      this.setState({ selectedOptions: [] });
    });
  };

  render() {
    const {
      queryName,
      customQuery,
      generateOptions,
      label,
      onSelect,
      name,
      values,
      search,
      multi,
      customOption,
      showAvatar = true
    } = this.props;

    const { selectedOptions } = this.state;

    const datas = customQuery[queryName] || [];

    const selectMultiple = (ops: IOption[]) => {
      onSelect(ops.map(option => option.value), name);

      this.setState({ selectedOptions: [...ops] });
    };

    const selectSingle = (option: IOption) => {
      onSelect(option ? option.value : '', name);

      this.setState({ selectedOptions: option ? [option] : [] });
    };

    const onChange = multi ? selectMultiple : selectSingle;

    const onSearch = (searchValue: string) => {
      if (searchValue) {
        debounce(() => search(searchValue), 1000)();
      }
    };

    const onOpen = () => search('reload');

    const ids = datas.map(data => data._id);
    const uniqueSelectedOptions = (selectedOptions || []).filter(
      option => !ids.includes(option.value)
    );
    const selectOptions = [...uniqueSelectedOptions, ...generateOptions(datas)];

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
          value={values}
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
        options: ({ searchValue, filterParams, values, abortController }) => {
          const context = { fetchOptions: { signal: abortController.signal } };

          if (searchValue === 'reload') {
            return {
              context,
              variables: {
                ids: typeof values === 'string' ? [values] : values,
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
            variables: {
              ids: typeof values === 'string' ? [values] : values,
              ...filterParams
            }
          };
        }
      })
    )(SelectWithSearch)
  );

type WrapperProps = {
  values: string | string[] | undefined;
  queryName: string;
  name: string;
  label: string;
  onSelect: (values: string[] | string, name: string) => void;
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

    const Component = this.withQuery;

    return (
      <Component
        {...this.props}
        abortController={abortController}
        search={this.search}
        searchValue={searchValue}
      />
    );
  }
}

export default Wrapper;
