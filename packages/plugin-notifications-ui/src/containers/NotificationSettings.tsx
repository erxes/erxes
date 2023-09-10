import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import {
  GetNotificationByEmailMutationResponse,
  GetNotificationByEmailMutationVariables,
  NotificationConfigsQueryResponse,
  NotificationModulesQueryResponse,
  SaveNotificationConfigMutationResponse,
  SaveNotificationConfigMutationVariables
} from '@erxes/ui-notifications/src/types';
import NotificationSettings from '../components/NotificationSettings';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { currentUser } from '@erxes/ui/src/auth/graphql';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { IQueryParams } from '@erxes/ui/src/types';

type Props = {
  queryParams: IQueryParams;
  history: any;
};

type FinalProps = {
  notificationModulesQuery: NotificationModulesQueryResponse;
  notificationConfigurationsQuery: NotificationConfigsQueryResponse;
  currentUser: IUser;
} & Props &
  GetNotificationByEmailMutationResponse &
  SaveNotificationConfigMutationResponse;

const NotificationSettingsContainer = (props: FinalProps) => {
  const {
    notificationModulesQuery,
    notificationConfigurationsQuery,
    configGetNotificationByEmailMutation,
    saveNotificationConfigurationsMutation,
    currentUser
  } = props;

  // save get notification by email
  const configGetNotificationByEmail = variables => {
    configGetNotificationByEmailMutation({ variables })
      .then(() => {
        Alert.success('You successfully changed a notification setting');
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  // save notification configurations
  const saveNotificationConfigurations = variables => {
    saveNotificationConfigurationsMutation({ variables })
      .then(() => {
        Alert.success('You successfully changed a notification setting');
        notificationConfigurationsQuery.refetch();
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  const configs =
    notificationConfigurationsQuery.notificationsGetConfigurations || [];

  // default value is checked
  let getNotificationByEmail = currentUser.getNotificationByEmail;
  if (getNotificationByEmail === undefined || getNotificationByEmail === null) {
    getNotificationByEmail = false;
  }

  const updatedProps = {
    ...props,
    modules: notificationModulesQuery.notificationsModules || [],
    configs,
    saveNotificationConfigurations,

    getNotificationByEmail,
    configGetNotificationByEmail
  };

  return <NotificationSettings {...updatedProps} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, NotificationModulesQueryResponse>(
      gql`
        query notificationsModules {
          notificationsModules
        }
      `,
      {
        name: 'notificationModulesQuery'
      }
    ),
    graphql<{}, NotificationConfigsQueryResponse>(
      gql`
        query notificationsGetConfigurations {
          notificationsGetConfigurations {
            _id
            notifType
            isAllowed
          }
        }
      `,
      {
        name: 'notificationConfigurationsQuery'
      }
    ),
    graphql<
      {},
      GetNotificationByEmailMutationResponse,
      GetNotificationByEmailMutationVariables
    >(
      gql`
        mutation usersConfigGetNotificationByEmail($isAllowed: Boolean) {
          usersConfigGetNotificationByEmail(isAllowed: $isAllowed) {
            _id
          }
        }
      `,
      {
        name: 'configGetNotificationByEmailMutation',
        options: () => ({
          refetchQueries: [
            {
              query: gql(currentUser)
            }
          ]
        })
      }
    ),
    graphql<
      {},
      SaveNotificationConfigMutationResponse,
      SaveNotificationConfigMutationVariables
    >(
      gql`
        mutation notificationsSaveConfig(
          $notifType: String!
          $isAllowed: Boolean
        ) {
          notificationsSaveConfig(
            notifType: $notifType
            isAllowed: $isAllowed
          ) {
            _id
          }
        }
      `,
      {
        name: 'saveNotificationConfigurationsMutation'
      }
    )
  )(withCurrentUser(NotificationSettingsContainer))
);
