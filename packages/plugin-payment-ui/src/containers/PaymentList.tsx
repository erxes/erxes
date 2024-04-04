import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import PaymentList from '../components/PaymentList';
import { mutations, queries } from '../graphql';
import {
  IPaymentDocument,
  PaymentRemoveMutationResponse,
  PaymentsQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  paymentsCount: number;
  kind: string | null;
};

type FinalProps = {
  paymentsQuery: PaymentsQueryResponse;
} & Props &
  PaymentRemoveMutationResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const { paymentsQuery, kind, paymentsRemove } = props;

  if (paymentsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const payments = paymentsQuery.payments || [];

  const removePayment = (payment: IPaymentDocument) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      paymentsRemove({ variables: { _id: payment._id } })
        .then(() => {
          Alert.success('You successfully deleted a payment method');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const filteredConfigs = kind
    ? payments.filter(pc => pc.kind === kind)
    : payments;

  const updatedProps = {
    ...props,
    payments: filteredConfigs,
    loading: paymentsQuery.loading,
    removePayment
  };

  return <PaymentList {...updatedProps} />;
};

const mutationOptions = () => ({
  refetchQueries: [
    {
      query: queries.payments,
      variables: {
        paymentIds: []
      }
    },
    {
      query: queries.paymentsTotalCountQuery
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, PaymentRemoveMutationResponse>(mutations.paymentRemove, {
      name: 'paymentsRemove',
      options: mutationOptions
    }),
    graphql<Props, PaymentsQueryResponse>(queries.payments, {
      name: 'paymentsQuery',
      options: () => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            paymentIds: []
          },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(IntegrationListContainer)
);
