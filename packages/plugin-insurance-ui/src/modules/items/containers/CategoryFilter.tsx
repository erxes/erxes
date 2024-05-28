import React from "react";
import { gql, useQuery } from '@apollo/client';
import Component from '../components/CategoryFilter';

type Props = {
  loadingMainQuery?: boolean;
  abortController?: any;

  queryCallback:(data: any) => void;
};

const QUERY = gql`
query InsuranceCategories($page: Int, $perPage: Int) {
  insuranceCategories(page: $page, perPage: $perPage) {
    _id
    code
    name
  }
}
`;

const CategoryFilter = (props: Props) => {
  const { loadingMainQuery, abortController } = props;
  const [categories, setCategories] = React.useState([]);

  const { data, loading, refetch } = useQuery(
    QUERY,
    {
      fetchPolicy: 'network-only',
      skip: loadingMainQuery || categories.length > 0,
      context: {
        fetchOptions: {
          signal: abortController && abortController.signal
        }
      }
    }
  );

  React.useEffect(() => {
    if (data) {
      setCategories(data.insuranceCategories || []);

      if (props.queryCallback) {
        props.queryCallback(data.insuranceCategories || []);
      }
    }
  }, [data]);

  const updatedProps = {
    ...props,
    categories,
    loading: loading,
    counts: { byCategory: 0 },
    emptyText: 'Filter by category'
  };

  return (
    <Component {...updatedProps} />
  );
};

export default CategoryFilter;
