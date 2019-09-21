import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  GetNotificationByEmailMutationResponse,
  GetNotificationByEmailMutationVariables,
  NotificationConfigsQueryResponse,
  NotificationModulesQueryResponse,
  SaveNotificationConfigMutationResponse,
  SaveNotificationConfigMutationVariables
} from '../../../notifications/types';
import NotificationSettings from '../components/NotificationSettings';

type Props = {
  notificationModulesQuery: NotificationModulesQueryResponse;
  notificationConfigurationsQuery: NotificationConfigsQueryResponse;
  currentUser: IUser;
} & GetNotificationByEmailMutationResponse &
  SaveNotificationConfigMutationResponse;

const NotificationSettingsContainer = (props: Props) => {
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
        name: 'configGetNotificationByEmailMutation'
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
  )(NotificationSettingsContainer)
);
