import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';

import List from '../../components/paymentConfig/List';
import { mutations, queries } from '../../graphql';
import {
  PaymentConfigsCountQueryResponse,
  PaymentConfigsQueryResponse,
  PaymentConfigsRemoveMutationResponse
} from '../../types';

type Props = {
  queryParams: any;
};

export default function ConfigListContainer(props: Props) {
  const { data, loading, refetch } = useQuery<PaymentConfigsQueryResponse>(
    queries.paymentConfigsQuery,
    {
      variables: {
        ...router.generatePaginationParams(props.queryParams || {})
      },
      fetchPolicy: 'network-only'
    }
  );

  const countResponse = useQuery<PaymentConfigsCountQueryResponse>(
    queries.paymentConfigsTotalCount,
    {
      fetchPolicy: 'network-only'
    }
  );

  const [removeMutation] = useMutation<PaymentConfigsRemoveMutationResponse>(
    mutations.paymentConfigsRemove
  );

  const remove = (_id: string) => {
    const message = 'Are you sure want to remove this config ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a config.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const extendedProps = {
    ...props,
    loading,
    configs: data ? data.getPaymentConfigs : [],
    totalCount:
      (countResponse.data && countResponse.data.paymentConfigsTotalCount) || 0,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
