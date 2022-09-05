import * as compose from 'lodash.flowright';

import { withProps } from '@erxes/ui/src/utils';
import { PaymentConfigsQueryResponse } from '../types';
import { queries } from '../graphql';

import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import PaymentSection from '../components/sample/PaymentSection';

type Props = {
  queryParams: any;
  type?: string;
};

type FinalProps = {
  paymentConfigsQuery: PaymentConfigsQueryResponse;
} & Props;

const PaymentSectionContainer = (props: FinalProps) => {
  const { paymentConfigsQuery } = props;

  if (paymentConfigsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const paymentConfigs = paymentConfigsQuery.paymentConfigs || [];

  const updatedProps = {
    ...props,
    paymentConfigs
  };

  return <PaymentSection {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, PaymentConfigsQueryResponse>(gql(queries.paymentConfigs), {
      name: 'paymentConfigsQuery',
      options: () => {
        return {
          fetchPolicy: 'network-only'
        };
      }
    })
  )(PaymentSectionContainer)
);
