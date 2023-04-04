import React from 'react';
import gql from 'graphql-tag';
import { useLazyQuery, useQuery } from 'react-apollo';
import SelectCategories from '../components/SelectCategories';

const CATEGORIES_QUERY = gql`
  query ProductCategories($searchValue: String) {
    productCategories(searchValue: $searchValue) {
      name
      code
      _id
    }
  }
`;

const Container = ({ onChange, value }) => {
  const [getCategories, { data, loading }] = useLazyQuery(CATEGORIES_QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      searchValue: ''
    }
  });

  const categoreisQuery = useQuery(CATEGORIES_QUERY, {
    variables: {
      searchValue: ''
    }
  });

  const onSearch = (searchValue: string) => {
    getCategories({
      variables: {
        searchValue
      }
    });
  };

  const filtered = (data && data.productCategories) || [];
  const allCategories =
    (categoreisQuery.data && categoreisQuery.data.productCategories) || [];

  return (
    <SelectCategories
      allCategories={allCategories}
      filtered={filtered}
      value={value}
      loading={loading}
      onSearch={onSearch}
      onChange={onChange}
    />
  );
};

export default Container;
