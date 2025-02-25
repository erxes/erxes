import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { gql, useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import Section from '../components/common/DealBurenSection';
import { queries } from '../graphql';
import { DetailQueryResponse } from '../types';

type Props = {
  showType?: string;
};

function BurenSectionContainer(props: Props) {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const customersQuery = useQuery(gql(queries.customers), {
    variables: {
      mainType: 'deal',
      mainTypeId: queryParams?.itemId || '',
      relType: 'customer',
      isSaved: true,
    },
  });

  const customerScore = useQuery<DetailQueryResponse>(
    gql(queries.getCustomerScore),
    {
      variables: {
        customerId: customersQuery?.data?.customers[0]._id || '',
      },
      fetchPolicy: 'network-only',
    }
  );

  if (customersQuery.loading) {
    return <Spinner />;
  }

  if (customerScore.loading) {
    return <Spinner />;
  }

  const data = customerScore.data?.getCustomerScore;

  const updatedProps = {
    ...props,
    burenCustomerScoring: data,
  };
  return <Section {...updatedProps} />;
}

export default BurenSectionContainer;
