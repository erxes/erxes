import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { withProps } from '@erxes/ui/src/utils';

import PaymentConfigHome from '../components/PaymentConfigHome';
import { queries } from '../graphql';
import { PaymentConfigsCountByTypeQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = {
  paymentConfigsCountByTypeQuery: PaymentConfigsCountByTypeQueryResponse;
} & Props;

const Store = (props: FinalProps) => {
  const { paymentConfigsCountByTypeQuery } = props;

  if (paymentConfigsCountByTypeQuery.loading) {
    return null;
  }

  const paymentConfigsCount =
    paymentConfigsCountByTypeQuery.paymentConfigsCountByType;

  const updatedProps = {
    ...props,
    paymentConfigsCount
  };

  return <PaymentConfigHome {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, PaymentConfigsCountByTypeQueryResponse, {}>(
      gql(queries.paymentConfigsCountByType),
      {
        name: 'paymentConfigsCountByTypeQuery'
      }
    )
  )(Store)
);
