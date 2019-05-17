import gql from 'graphql-tag';
import { Avatar, SelectOption, SelectValue } from 'modules/deals/styles/deal';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Select from 'react-select-plus';
import { __, withProps } from '../utils';

type Props = {
  searchValue: string;
  value: string;
  queryName: string;
  name: string;
  label: string;
  onSelect: (name: string, values) => void;
  search: (search: string, loadMore?: boolean) => void;
  options?: any;
  customQuery?: any;
};

const content = option => (
  <React.Fragment>
    <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
    {option.label}
  </React.Fragment>
);

export const optionRenderer = option => (
  <SelectOption className="simple-propOption">{content(option)}</SelectOption>
);

export const valueRenderer = option => (
  <SelectValue>{content(option)}</SelectValue>
);

class SelectWithSearch extends React.Component<Props> {
  render() {
    const {
      queryName,
      customQuery,
      options,
      label,
      onSelect,
      name,
      value,
      search
    } = this.props;

    const datas = customQuery[queryName] || [];

    const onChange = list => onSelect(name, list.map(item => item.value));
    const onSearch = searchValue => search(searchValue);

    const selectOption = options(datas);

    return (
      <Select
        placeholder={__(label)}
        value={value}
        onChange={onChange}
        optionRenderer={optionRenderer}
        valueRenderer={valueRenderer}
        onInputChange={onSearch}
        options={selectOption}
        removeSelected={true}
        multi={true}
      />
    );
  }
}

const withQuery = ({ customQuery }) =>
  withProps<Props>(
    compose(
      graphql<Props, {}, { searchValue: string }>(gql(customQuery), {
        name: 'customQuery',
        options: ({ searchValue }) => ({
          variables: { searchValue, perPage: 10 }
        })
      })
    )(SelectWithSearch)
  );

type WrapperProps = {
  value: string;
  queryName: string;
  name: string;
  label: string;
  onSelect: (name: string, values) => void;
  options?: any;
  customQuery?: any;
};

class Wrapper extends React.Component<
  WrapperProps,
  { searchValue: string },
  { WithQuery: React.ReactNode }
> {
  private WithQuery;

  constructor(props) {
    super(props);

    this.WithQuery = withQuery({ customQuery: this.props.customQuery });

    this.state = { searchValue: '' };
  }

  search = (searchValue: string) => this.setState({ searchValue });

  render() {
    const { searchValue } = this.state;
    const Component = this.WithQuery;

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
