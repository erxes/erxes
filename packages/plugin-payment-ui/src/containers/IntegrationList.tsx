import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  PaymentConfigsRemoveMutationResponse,
  PaymentConfigsQueryResponse,
  IPaymentConfig
} from '../types';
import { mutations, queries } from '../graphql';

import IntegrationList from '../components/IntegrationList';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
// import { integrationsListParams } from '../utils';

type Props = {
  queryParams: any;
  variables?: { brandId?: string; channelId?: string };
  integrationsCount: number;
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

  const removePaymentConfig = (paymentConfig: IPaymentConfig) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      Alert.warning('Removing... Please wait!!!');

      paymentConfigsRemove({ variables: { id: paymentConfig._id } })
        .then(() => {
          Alert.success('Your integration is no longer in this channel');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // const archive = (id: string, status: boolean) => {
  //   let message =
  //     "If you archive an integration, then you won't be able to see customers & conversations related to this integration anymore. Are you sure?";
  //   let action = 'archived';

  //   if (!status) {
  //     message = 'You are going to unarchive this integration. Are you sure?';
  //     action = 'unarchived';
  //   }

  //   confirm(message).then(() => {
  //     archiveIntegration({ variables: { _id: id, status } })
  //       .then(({ data }) => {
  //         const integration = data.integrationsArchive;

  //         if (integration && integration._id) {
  //           Alert.success(`Integration has been ${action}.`);
  //         }
  //       })
  //       .catch((error: Error) => {
  //         Alert.error(error.message);
  //       });
  //   });
  // };

  // const editIntegration = (
  //   id: string,
  //   { name, brandId, channelIds, data }: IntegrationMutationVariables
  // ) => {
  //   if (!name && !brandId) {
  //     Alert.error('Name and brand must be chosen');

  //     return;
  //   }

  //   editCommonFields({
  //     variables: { _id: id, name, brandId, channelIds, data }
  //   })
  //     .then(response => {
  //       const result = response.data.integrationsEditCommonFields;

  //       if (result && result._id) {
  //         Alert.success('Integration has been edited.');
  //       }
  //     })
  //     .catch((error: Error) => {
  //       Alert.error(error.message);
  //     });
  // };

  const filteredConfigs = type
    ? paymentConfigs.filter(pc => pc.type === type)
    : paymentConfigs;

  const updatedProps = {
    ...props,
    paymentConfigs: filteredConfigs,
    loading: paymentConfigsQuery.loading,
    removePaymentConfig
  };

  return <IntegrationList {...updatedProps} />;
};

const mutationOptions = () => ({
  refetchQueries: [
    {
      query: gql(queries.paymentConfigs)
    },
    {
      query: gql(queries.paymentConfigsCountByType)
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, PaymentConfigsRemoveMutationResponse>(
      gql(mutations.PaymentConfigRemove),
      {
        name: 'paymentConfigsRemove',
        options: mutationOptions
      }
    ),
    graphql<Props, PaymentConfigsQueryResponse>(gql(queries.paymentConfigs), {
      name: 'paymentConfigsQuery',
      options: ({ variables }) => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            ...variables
          },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(IntegrationListContainer)
);
