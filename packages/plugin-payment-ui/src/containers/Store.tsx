import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Home from '../components/Home';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
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

  console.log('store container:', paymentConfigsCount);

  const updatedProps = {
    ...props,
    paymentConfigsCount
  };

  return <Home {...updatedProps} />;
};

// export default Store;

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
