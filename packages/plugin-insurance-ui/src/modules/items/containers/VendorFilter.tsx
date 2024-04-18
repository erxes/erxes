import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Component from '../components/VendorFilter';

type Props = {
  loadingMainQuery?: boolean;
  abortController?: any;
  queryParams: any;
  queryCallback: (data: any) => void;
};

const QUERY = gql`
query ClientPortalCompanies($clientPortalId: String!) {
  clientPortalCompanies(clientPortalId: $clientPortalId) {
    _id
    company {
      _id
      primaryName
    }
  }
}
`;

const CategoryFilter = (props: Props) => {
  const { loadingMainQuery, abortController } = props;
  const [companies, setCompanies] = React.useState([]);

  const { data, loading, refetch } = useQuery(
    QUERY,

    {
      variables: {
        clientPortalId: 'RnisXf0uAWdEjvkx39Ih6',
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
        setCompanies(data.clientPortalCompanies);
      props.queryCallback(data.clientPortalCompanies || []);
    }
  }, [data]);

  const updatedProps = {
    ...props,
    companies,
    loading: loading,
    counts: { byProduct: 0 },
    emptyText: 'Filter by vendor',
  };

  return <Component {...updatedProps} />;
};

export default CategoryFilter;
