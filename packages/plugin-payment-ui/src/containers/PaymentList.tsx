import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';

import PaymentList from '../components/PaymentList';
import { mutations, queries } from '../graphql';
import {
  IPaymentDocument,
  PaymentRemoveMutationResponse,
  PaymentsQueryResponse,
} from '../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
  paymentsCount: number;
  kind: string | null;
};

const IntegrationListContainer = (props: Props) => {
  const { kind } = props;

  const paymentsQuery = useQuery<PaymentsQueryResponse>(queries.payments, {
    notifyOnNetworkStatusChange: true,
    variables: {
      paymentIds: [],
      kind,
    },
    fetchPolicy: 'network-only',
  });

  const [paymentsRemove] = useMutation<PaymentRemoveMutationResponse>(
    mutations.paymentRemove,
    {
      refetchQueries: [
        {
          query: queries.payments,
          variables: {
            paymentIds: [],
          },
        },
        {
          query: queries.paymentsTotalCountQuery,
        },
      ],
    },
  );

  if (paymentsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const payments = (paymentsQuery.data && paymentsQuery.data.payments) || [];

  const removePayment = (payment: IPaymentDocument) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      paymentsRemove({ variables: { _id: payment._id } })
        .then(() => {
          Alert.success('You successfully deleted a payment method');
        })

        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const filteredConfigs = kind
    ? payments.filter((pc) => pc.kind === kind)
    : payments;

  const updatedProps = {
    ...props,
    payments: filteredConfigs,
    loading: paymentsQuery.loading,
    removePayment,
  };

  return <PaymentList {...updatedProps} />;
};

export default IntegrationListContainer;
