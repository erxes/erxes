import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
// local
import { queries } from '../../graphql';
import ListComponent from '../../components/plan/List';

type Props = {
  count: number;
  params: any;
};

const ListContainer = (props: Props) => {
  const plans = useQuery(gql(queries.pricingPlans), {
    variables: { ...props.params },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  return (
    <ListComponent
      data={plans.data ? plans.data.pricingPlans : []}
      count={props.count}
      loading={plans.loading}
    />
  );
};

export default ListContainer;
