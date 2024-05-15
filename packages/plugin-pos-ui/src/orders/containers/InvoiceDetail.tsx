import * as compose from 'lodash.flowright';
import Detail from '../components/Detail';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { PosOrderChangePaymentsMutationResponse } from '../types';
import { OrderDetailQueryResponse } from '../types';
import { Spinner, withProps } from '@erxes/ui/src';
import queries from '../graphql/queries';

type Props = {
  invoice: any;
};

const InvoiceDetail = (props: Props) => {
  const { invoice } = props;

  const orderDetailQuery = useQuery<OrderDetailQueryResponse>(
    gql(queries.posOrderDetail),
    {
      skip: invoice.contentType !== 'pos:orders',
      variables: {
        _id: invoice.contentTypeId,
      },
      fetchPolicy: 'network-only',
    },
  );

  if (orderDetailQuery && orderDetailQuery.loading) {
    return <Spinner />;
  }

  if (!orderDetailQuery) {
    return <></>;
  }

  const order = orderDetailQuery?.data?.posOrderDetail;

  if (!order) {
    return <>Pos order not synced yet, only on posclient</>;
  }

  const updatedProps = {
    ...props,
    order,
  };

  return <Detail {...updatedProps} />;
};

export default InvoiceDetail;
