import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Component from '../components/ProductFilter';

type Props = {
  loadingMainQuery?: boolean;
  abortController?: any;
  queryParams: any;
  queryCallback: (data: any) => void;
};

const QUERY = gql`
  query InsuranceProducts($categoryId: ID) {
    insuranceProducts(categoryId: $categoryId) {
      _id
      name
    }
  }
`;

const CategoryFilter = (props: Props) => {
  const { loadingMainQuery, abortController } = props;
  const [products, setProducts] = React.useState([]);

  const { data, loading, refetch } = useQuery(
    QUERY,

    {
      variables: {
        categoryId: props.queryParams.category,
      },
      fetchPolicy: 'network-only',
      skip: loadingMainQuery,
      context: {
        fetchOptions: {
          signal: abortController && abortController.signal,
        },
      },
    }
  );

  React.useEffect(() => {
    if (data) {
      setProducts(data.insuranceProducts);
      props.queryCallback(data.insuranceProducts || []);
    }
  }, [data]);

  const updatedProps = {
    ...props,
    products,
    loading: loading,
    counts: { byProduct: 0 },
    emptyText: 'Filter by product',
  };

  return <Component {...updatedProps} />;
};

export default CategoryFilter;
