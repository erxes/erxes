import React from 'react';
// import * as compose from 'lodash.flowright';
import { gql, useQuery } from '@apollo/client';
import Form from '../component/GetConfigs'
import { paymentConfigs } from '../graphql/queries';
import { PaymentConfigsQueryResponse } from '../types';


type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = {
  paymentConfigsQuery: PaymentConfigsQueryResponse;
} & Props;

const GetConfigs = (props: FinalProps) => {

  const { error, loading, data } = useQuery(
    paymentConfigs
  );

  if (loading) {
    return null;
  }

  const paymentConfigsData = data.paymentConfigs;
  console.log("paymentConfigs on x: ", paymentConfigsData);
  return <Form paymentConfigs={paymentConfigsData} />

};

export default GetConfigs;
