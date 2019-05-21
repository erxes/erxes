import gql from 'graphql-tag';
import { Avatar, SelectOption, SelectValue } from 'modules/deals/styles/deal';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Select from 'react-select-plus';
import { IOption } from '../types';
import { __, withProps } from '../utils';

type Props = {
  searchValue: string;
  values: string | string[] | undefined;
  search: (search: string, loadMore?: boolean) => void;
} & WrapperProps;

const content = (option: IOption): React.ReactNode => (
  <React.Fragment>
    <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
    {option.label}
  </React.Fragment>
);

export const selectOptionRenderer = (option: IOption): React.ReactNode => (
  <SelectOption className="simple-propOption">{content(option)}</SelectOption>
);

export const selectValueRenderer = (option: IOption): React.ReactNode => (
  <SelectValue>{content(option)}</SelectValue>
);

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
      customOption
    } = this.props;

    const { selectedOptions } = this.state;

    const datas = customQuery[queryName] || [];

    const selectMultiple = (ops: IOption[]) => {
      onSelect(ops.map(option => option.value), name);

      this.setState({ selectedOptions: [...ops] });
    };

    const selectSingle = (option: IOption) => {
      onSelect(option.value, name);

      this.setState({ selectedOptions: [option] });
    };

    const onChange = multi ? selectMultiple : selectSingle;

    const onSearch = (searchValue: string) => {
      if (searchValue) {
        search(searchValue);
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
      optionRenderer = selectOptionRenderer;
      valueRenderer = selectValueRenderer;
    }

    return (
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
          options: ({ searchValue, values }) => {
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

            return {
              variables: { ids: typeof values === 'string' ? [values] : values }
            };
          }
        }
      )
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
  customOption?: {
    value: string;
    label: string;
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
