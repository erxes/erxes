import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { NotificationSettings } from '../components';

type Props = {
  notificationModulesQuery: any;
  notificationConfigurationsQuery: any;
  configGetNotificationByEmailMutation: (params: { variables: {
    byEmail: { isAllowed: boolean }
  } }) => Promise<any>;
  saveNotificationConfigurationsMutation: (params: { variables: {
    notify: { notifType: string, isAllowed: boolean }
  } }) => Promise<any>;

  currentUser: IUser;
};

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
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  // save notification configurations
  const saveNotificationConfigurations = variables => {
    saveNotificationConfigurationsMutation({ variables })
      .then(() => {
        Alert.success('Congrats');
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
    getNotificationByEmail = true;
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

export default compose(
  graphql(
    gql`
      query notificationsModules {
        notificationsModules
      }
    `,
    {
      name: 'notificationModulesQuery'
    }
  ),
  graphql(
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
  graphql(
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
  graphql(
    gql`
      mutation notificationsSaveConfig(
        $notifType: String!
        $isAllowed: Boolean
      ) {
        notificationsSaveConfig(notifType: $notifType, isAllowed: $isAllowed) {
          _id
        }
      }
    `,
    {
      name: 'saveNotificationConfigurationsMutation'
    }
  )
)(NotificationSettingsContainer);
