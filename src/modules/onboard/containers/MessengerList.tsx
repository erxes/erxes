import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import {
  mutations,
  queries as integrationQuery
} from 'modules/settings/integrations/graphql';
import {
  IntegrationsQueryResponse,
  RemoveMutationResponse
} from 'modules/settings/integrations/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { MessengerList } from '../components';
import { queries } from '../graphql';

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
} & RemoveMutationResponse;

const MessengerListContainer = (props: FinalProps) => {
  const { integrationsQuery, removeMutation } = props;

  const messengerApps = integrationsQuery.integrations || [];

  const remove = appId => {
    confirm().then(() => {
      removeMutation({ variables: { _id: appId } })
        .then(() => {
          Alert.success('You successfully deleted an app');
        })

        .catch(error => {
          Alert.error(error.reason);
        });
    });
  };

  const updatedProps = {
    ...props,
    remove,
    messengerApps
  };

  return <MessengerList {...updatedProps} />;
};

export default compose(
  graphql<IntegrationsQueryResponse>(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: () => {
      return {
        notifyOnNetworkStatusChange: true,
        variables: {
          kind: 'messenger'
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql<RemoveMutationResponse>(gql(mutations.integrationsRemove), {
    name: 'removeMutation',
    options: () => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              kind: 'messenger'
            }
          },
          {
            query: gql(integrationQuery.integrationTotalCount)
          }
        ]
      };
    }
  })
)(MessengerListContainer);
