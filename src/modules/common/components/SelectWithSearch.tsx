import gql from 'graphql-tag';
import { Avatar, SelectOption, SelectValue } from 'modules/deals/styles/deal';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Select from 'react-select-plus';
import { Option } from '../types';
import { __, withProps } from '../utils';

type Props = {
  searchValue: string;
  value: string[];
  search: (search: string, loadMore?: boolean) => void;
} & WrapperProps;

const content = (option: Option): React.ReactNode => (
  <React.Fragment>
    <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
    {option.label}
  </React.Fragment>
);

export const selectOptionRenderer = (option: Option): React.ReactNode => (
  <SelectOption className="simple-propOption">{content(option)}</SelectOption>
);

export const selectValueRenderer = (option: Option): React.ReactNode => (
  <SelectValue>{content(option)}</SelectValue>
);

class SelectWithSearch extends React.Component<
  Props,
  { selectedItems?: Option[] }
> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItems: undefined
    };
  }

  componentWillUpdate(nextProps: Props) {
    const {
      queryName,
      customQuery,
      options,
      value = [] as string[]
    } = nextProps;

    const datas = customQuery[queryName] || [];
    const loading = customQuery.loading;

    if (!this.state.selectedItems && !loading) {
      this.setState({
        selectedItems: options(datas.filter(data => value.includes(data._id)))
      });
    }
  }

  render() {
    const {
      queryName,
      customQuery,
      options,
      label,
      onSelect,
      name,
      value,
      search,
      multi,
      customOption
    } = this.props;

    const { selectedItems } = this.state;

    const datas = customQuery[queryName] || [];

    const selectMultiple = items => {
      onSelect(items.map(item => item.value), name);

      this.setState({ selectedItems: [...items] });
    };

    const selectSingle = item => {
      onSelect(item, name);

      this.setState({ selectedItems: [item] });
    };

    const onChange = multi ? selectMultiple : selectSingle;

    const onSearch = (searchValue: string) => {
      if (searchValue) {
        search(searchValue);
      }
    };

    const onOpen = () => search('reload');

    const selectOptions = [...(selectedItems || []), ...options(datas)];

    if (customOption) {
      selectOptions.unshift(customOption);
    }

    let optionRenderer;
    let valueRenderer;

    if (multi) {
      optionRenderer = selectOptionRenderer;
      valueRenderer = selectValueRenderer;
    }

    return (
      <Select
        key={value}
        placeholder={__(label)}
        value={value}
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
    );
  }
}

const withQuery = ({ customQuery }) =>
  withProps<Props>(
    compose(
      graphql<Props, {}, { searchValue?: string; ids?: string[] }>(
        gql(customQuery),
        {
          name: 'customQuery',
          options: ({ searchValue, value }) => {
            if (searchValue === 'reload') {
              return {
                variables: { searchValue: '' },
                fetchPolicy: 'network-only',
                notifyOnNetworkStatusChange: true
              };
            }

            if (searchValue) {
              return { variables: { searchValue } };
            }

            return { variables: { ids: value } };
          }
        }
      )
    )(SelectWithSearch)
  );

type WrapperProps = {
  value?: string;
  queryName: string;
  name: string;
  label: string;
  onSelect: (values: string, name: string) => void;
  options?: any;
  customQuery?: any;
  multi?: boolean;
  customOption?: {
    value?: string;
    label?: string;
    avatar?: string;
  };
};

class Wrapper extends React.Component<
  WrapperProps,
  { searchValue: string },
  { WithQuery: React.ReactNode }
> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery({ customQuery: this.props.customQuery });

    this.state = { searchValue: '' };
  }

  search = (searchValue: string) => this.setState({ searchValue });

  render() {
    const { searchValue } = this.state;
    const Component = this.withQuery;

    return (
      <Component
        {...this.props}
        search={this.search}
        searchValue={searchValue}
      />
    );
  }
}

export default Wrapper;
