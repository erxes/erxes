import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { withProps } from '@erxes/ui/src/utils';

import PaymentConfigHome from '../components/PaymentConfigHome';
import { queries } from '../graphql';
import {
  ByKindTotalCount,
  PaymentConfigsCountByTypeQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = {
  paymentsTotalCountQuery: PaymentConfigsCountByTypeQueryResponse;
} & Props;

const Store = (props: FinalProps) => {
  const { paymentsTotalCountQuery } = props;

  if (paymentsTotalCountQuery.loading) {
    return null;
  }

  const totalCount =
    (paymentsTotalCountQuery.paymentsTotalCount || {}).byKind ||
    ({} as ByKindTotalCount);

  const updatedProps = {
    ...props,
    totalCount
  };

  return <PaymentConfigHome {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, PaymentConfigsCountByTypeQueryResponse, {}>(
      gql(queries.paymentsTotalCountQuery),
      {
        name: 'paymentsTotalCountQuery'
      }
    )
  )(Store)
);
