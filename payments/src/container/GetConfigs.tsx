// import gql from 'graphql-tag';
// import { flowRight as compose } from 'lodash';
// import { graphql } from 'react-apollo';

// import Form from '../component/GetConfigs';
// import { paymentConfigs } from '../graphql';
// import { PaymentConfigsQueryResponse } from '../types';

// import * as React from 'react';


// type Props = {
//   queryParams?: any;
//   history?: any;
// };

// type FinalProps = {
//   paymentConfigsQuery?: PaymentConfigsQueryResponse;
// } & Props;

// const GetConfigs = (props: FinalProps) => {

//   const { paymentConfigsQuery } = props;


//   if (paymentConfigsQuery?.loading) {
//     return null;
//   }

//   const paymentConfigsData = paymentConfigsQuery?.paymentConfigs;
//   console.log("paymentConfigs on container: ", paymentConfigsData);
//   return <Form paymentConfigs={paymentConfigsData} />

// };
// export default (
//   compose(
//     graphql<Props, PaymentConfigsQueryResponse, {}>(
//       gql(paymentConfigs),
//       {
//         name: 'paymentConfigsQuery'
//       }
//     )
//   )(GetConfigs)
// )

import * as React from 'react';
// import * as compose from 'lodash.flowright';
import { useQuery } from '@apollo/client';
import Form from '../component/GetConfigs'
import { paymentConfigs } from '../graphql/queries';
import { PaymentConfigsQueryResponse } from '../types';


type Props = {
  queryParams?: any;
  history?: any;
};

type FinalProps = {
  paymentConfigsQuery?: PaymentConfigsQueryResponse;
} & Props;

const GetConfigs = (props: FinalProps) => {

  const { loading, data } = useQuery(
    paymentConfigs
  );

  if (loading) {
    return null;
  }

  const paymentConfigsData = data.paymentConfigs;
  console.log("paymentConfigs on container: ", paymentConfigsData);
  return <Form paymentConfigs={paymentConfigsData} />

};

export default GetConfigs;
