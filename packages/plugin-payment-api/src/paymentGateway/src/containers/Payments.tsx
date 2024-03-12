import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Component from '../components/Payments';

const PAYMENTS = gql`
  query Payments($status: String) {
    payments(status: $status) {
      _id
      kind
      name
    }
  }
`;

type Props = {};

const Payments = (props: Props) => {
  const { data, loading } = useQuery(PAYMENTS);

  console.log('data', data);

  if (loading) {
    return <>Loading...</>;
  }

  return <Component payments={data.payments} />;
};

export default Payments;
