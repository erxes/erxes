import client from 'apolloClient';
import { gql } from '@apollo/client';
import { queries as generalQueries } from '@erxes/ui-settings/src/general/graphql';
import React from 'react';
import Search from '../components/Search';

class SearchContainer extends React.Component<
  {},
  { results; loading: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { results: null, loading: false };
  }

  clearSearch = () => {
    this.setState({ results: null });
  };

  onSearch = e => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const value = e.currentTarget.value;

      if (!value) {
        return this.setState({ results: null });
      }

      this.setState({ loading: true });

      client
        .query({
          query: gql(generalQueries.search),
          variables: {
            value
          }
        })
        .then(({ data, loading }) => {
          if (!loading && data.search) {
            this.setState({ results: data.search, loading: false });
          }
        });
    }
  };

  render() {
    return (
      <Search
        onSearch={this.onSearch}
        results={this.state.results}
        loading={this.state.loading}
        clearSearch={this.clearSearch}
      />
    );
  }
}

export default SearchContainer;
