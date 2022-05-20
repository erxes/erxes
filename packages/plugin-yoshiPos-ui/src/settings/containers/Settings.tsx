import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React from 'react';
import Settings from '../components/Settings';
import withCurrentUser from '../../auth/containers/withCurrentUser';
import { Alert } from '../../common/utils';
import { graphql } from 'react-apollo';
import { IConfig, IRouterProps } from '../../types';
import { IUser } from '../../auth/types';
import { mutations, queries } from '../graphql';
import {
  PosUsersQueryResponse,
  SyncConfigMutationResponse,
  SyncOrdersMutationResponse,
  DeleteOrdersMutationResponse
} from '../types';
import { withProps } from '../../utils';
import { withRouter } from 'react-router-dom';
import Spinner from '../../common/components/Spinner';

type Props = {
  syncConfigMutation: SyncConfigMutationResponse;
  syncOrdersMutation: SyncOrdersMutationResponse;
  deleteOrdersMutation: DeleteOrdersMutationResponse;
  posUsersQuery: PosUsersQueryResponse;
  posCurrentUser: IUser;
  currentConfig: IConfig;
  qp: any;
} & IRouterProps;

class SettingsContainer extends React.Component<Props> {
  render() {
    const {
      syncConfigMutation,
      syncOrdersMutation,
      deleteOrdersMutation,
      posUsersQuery
    } = this.props;

    const syncConfig = (type: string) => {
      syncConfigMutation({ variables: { type } })
        .then(({ data }) => {
          Alert.success(`${type} has been synced successfully.`);
        })
        .catch(e => {
          return Alert.error(e.message);
        });
    };

    const syncOrders = () => {
      syncOrdersMutation()
        .then(({ data }) => {
          const { syncOrders } = data;
          if (syncOrders) {
            if (syncOrders.sumCount > syncOrders.syncedCount) {
              return Alert.success(
                `${
                  syncOrders.syncedCount
                } order has been synced successfully. But less count ${syncOrders.sumCount -
                  syncOrders.syncedCount}`
              );
            }
            return Alert.success(
              `${syncOrders.syncedCount} order has been synced successfully`
            );
          }
        })
        .catch(e => {
          return Alert.error(e.message);
        });
    };

    const deleteOrders = () => {
      deleteOrdersMutation()
        .then(({ data }) => {
          const { deleteOrders } = data;
          return Alert.success(
            `${deleteOrders.deletedCount} order has been synced successfully`
          );
        })
        .catch(e => {
          return Alert.error(e.message);
        });
    };

    if (posUsersQuery.loading) {
      return <Spinner />;
    }
    const posUsers = posUsersQuery.posUsers || [];

    const updatedProps = {
      ...this.props,
      syncConfig,
      syncOrders,
      deleteOrders,
      posUsers
    };

    return <Settings {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SyncConfigMutationResponse>(gql(mutations.syncConfig), {
      name: 'syncConfigMutation'
    }),
    graphql<Props, SyncOrdersMutationResponse>(gql(mutations.syncOrders), {
      name: 'syncOrdersMutation'
    }),
    graphql<Props, SyncOrdersMutationResponse>(gql(mutations.deleteOrders), {
      name: 'deleteOrdersMutation'
    }),
    graphql<Props>(gql(queries.posUsers), {
      name: 'posUsersQuery',
      options: ({ qp }) => ({
        variables: { _id: qp && qp.id },
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(withRouter<Props>(SettingsContainer)))
);
