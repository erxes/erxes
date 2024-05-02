import React from 'react';

import PaymentHome from '../components/PaymentHome';
import { queries } from '../graphql';
import { ByKindTotalCount, PaymentsCountByTypeQueryResponse } from '../types';
import { useQuery } from '@apollo/client';

type Props = {
  queryParams: any;
  history?: any;
};

const Store = (props: Props) => {
  const paymentsTotalCountQuery = useQuery<PaymentsCountByTypeQueryResponse>(
    queries.paymentsTotalCountQuery,
  );

  if (paymentsTotalCountQuery.loading) {
    return null;
  }

  const totalCount =
    (
      (paymentsTotalCountQuery.data &&
        paymentsTotalCountQuery.data.paymentsTotalCount) ||
      {}
    ).byKind || ({} as ByKindTotalCount);

  const updatedProps = {
    ...props,
    totalCount,
  };

  return <PaymentHome {...updatedProps} />;
};

export default Store;
