import * as compose from 'lodash.flowright';
import Detail from '../components/Detail';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import { graphql } from '@apollo/client/react/hoc';
import { IOrderDet, PosOrderChangePaymentsMutationResponse } from '../types';
import { mutations, queries } from '../graphql';
import { OrderDetailQueryResponse } from '../types';
import { IPos, PosDetailQueryResponse } from '../../types';
import { queries as posQueries } from '../../pos/graphql';
import { Spinner, withProps } from '@erxes/ui/src';

type Props = {
  orderId: string;
  posToken?: string;
};

const OrdersDetailContainer = (props: Props) => {
  const { orderId, posToken } = props;

  const orderDetailQuery = useQuery<OrderDetailQueryResponse>(
    gql(queries.posOrderDetail),
    {
      variables: {
        _id: orderId,
      },
      fetchPolicy: 'network-only',
    },
  );

  const posDetailQuery = useQuery<PosDetailQueryResponse>(
    gql(posQueries.posDetail),
    {
      skip: !posToken,
      variables: {
        _id: posToken,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [posOrderChangePayments] =
    useMutation<PosOrderChangePaymentsMutationResponse>(
      gql(mutations.posOrderChangePayments),
      {
        refetchQueries: ['posOrders', 'posOrdersSummary', 'posOrderDetail'],
      },
    );

  const onChangePayments = (orderId, cashAmount, mobileAmount, paidAmounts) => {
    posOrderChangePayments({
      variables: {
        _id: orderId,
        cashAmount,
        mobileAmount,
        paidAmounts,
      },
    })
      .then(() => {
        Alert.success('You successfully synced erkhet.');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (orderDetailQuery.loading || (posDetailQuery && posDetailQuery.loading)) {
    return <Spinner />;
  }

  const order = orderDetailQuery?.data?.posOrderDetail || ({} as IOrderDet);
  const pos =
    (posDetailQuery && posDetailQuery?.data?.posDetail) || ({} as IPos);

  const updatedProps = {
    ...props,
    onChangePayments,
    pos,
    order,
  };

  return <Detail {...updatedProps} />;
};

export default OrdersDetailContainer;
