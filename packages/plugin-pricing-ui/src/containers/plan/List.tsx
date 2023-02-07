import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
// local
import { queries } from '../../graphql';
import ListComponent from '../../components/plan/List';

const ListContainer = () => {
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { status = '' } = query;

  const plans = useQuery(gql(queries.pricingPlans), {
    variables: { status },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  return (
    <ListComponent
      data={plans.data ? plans.data.pricingPlans : []}
      loading={plans.loading}
    />
  );
};

export default ListContainer;
