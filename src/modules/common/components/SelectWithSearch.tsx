import gql from 'graphql-tag';
import { Avatar, SelectOption, SelectValue } from 'modules/deals/styles/deal';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import Select from 'react-select-plus';
import { __, withProps } from '../utils';

type Props = {
  searchValue: string;
  perPage: number;
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

export const selectOption = option => (
  <SelectOption className="simple-propOption">{content(option)}</SelectOption>
);

export const selectValue = option => (
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

    const onChange = list => {
      onSelect(name, list.map(item => item.value));
    };

    const onSearch = searchValue => search(searchValue);

    return (
      <Select
        placeholder={__(label)}
        value={value}
        onChange={onChange}
        optionRenderer={selectOption}
        valueRenderer={selectValue}
        removeSelected={true}
        options={options(datas)}
        onInputChange={onSearch}
        multi={true}
      />
    );
  }
}

const getOptions = ({ searchValue, perPage }) => ({
  variables: { searchValue, perPage }
});

const withQuery = ({ customQuery }) =>
  withProps<Props>(
    compose(
      graphql<Props>(gql(customQuery), {
        name: 'customQuery',
        options: searchProps => getOptions(searchProps)
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

let WithQuery;

export default class Wrapper extends React.Component<
  WrapperProps,
  { perPage: number; searchValue: string }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '' };

    WithQuery = withQuery({ customQuery: this.props.customQuery });
  }

  search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  };

  render() {
    const { searchValue, perPage } = this.state;

    return (
      <WithQuery
        {...this.props}
        search={this.search}
        searchValue={searchValue}
        perPage={perPage}
      />
    );
  }
}
