import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';

import PaymentConfigList from '../components/PaymentConfigList';
import { mutations, queries } from '../graphql';
import {
  IPaymentConfigDocument,
  PaymentConfigsQueryResponse,
  PaymentConfigsRemoveMutationResponse
} from '../types';

type Props = {
  queryParams: any;
  paymentConfigsCount: number;
  type: string | null;
};

type FinalProps = {
  paymentConfigsQuery: PaymentConfigsQueryResponse;
} & Props &
  PaymentConfigsRemoveMutationResponse;

const IntegrationListContainer = (props: FinalProps) => {
  const { paymentConfigsQuery, type, paymentConfigsRemove } = props;

  if (paymentConfigsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const paymentConfigs = paymentConfigsQuery.paymentConfigs || [];

  const removePaymentConfig = (paymentConfig: IPaymentConfigDocument) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      paymentConfigsRemove({ variables: { id: paymentConfig._id } })
        .then(() => {
          Alert.success('Your config not found');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const filteredConfigs = type
    ? paymentConfigs.filter(pc => pc.type === type)
    : paymentConfigs;

  const updatedProps = {
    ...props,
    paymentConfigs: filteredConfigs,
    loading: paymentConfigsQuery.loading,
    removePaymentConfig
  };

  return <PaymentConfigList {...updatedProps} />;
};

const mutationOptions = () => ({
  refetchQueries: [
    {
      query: gql(queries.paymentConfigs),
      variables: {
        paymentConfigIds: []
      }
    },
    {
      query: gql(queries.paymentConfigsCountByType)
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, PaymentConfigsRemoveMutationResponse>(
      gql(mutations.paymentConfigRemove),
      {
        name: 'paymentConfigsRemove',
        options: mutationOptions
      }
    ),
    graphql<Props, PaymentConfigsQueryResponse>(gql(queries.paymentConfigs), {
      name: 'paymentConfigsQuery',
      options: () => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            paymentConfigIds: []
          },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(IntegrationListContainer)
);
