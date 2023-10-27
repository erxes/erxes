import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import PaymentHome from '../components/PaymentHome';
import { queries } from '../graphql';
import { ByKindTotalCount, PaymentsCountByTypeQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = {
  paymentsTotalCountQuery: PaymentsCountByTypeQueryResponse;
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

  return <PaymentHome {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, PaymentsCountByTypeQueryResponse, {}>(
      queries.paymentsTotalCountQuery,
      {
        name: 'paymentsTotalCountQuery'
      }
    )
  )(Store)
);
