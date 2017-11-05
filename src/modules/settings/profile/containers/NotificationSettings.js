import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { withCurrentUser } from 'modules/auth/containers';
import { Alert } from 'modules/common/utils';
import { NotificationSettings } from '../components';

const NotificationSettingsContainer = props => {
  const {
    currentUser,
    notificationModulesQuery,
    notificationConfigurationsQuery,
    configGetNotificationByEmailMutation,
    saveNotificationConfigurationsMutation
  } = props;

  if (
    notificationModulesQuery.loading ||
    notificationConfigurationsQuery.loading
  ) {
    return null;
  }

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
    notificationConfigurationsQuery.notificationsGetConfigurations;

  // default value is checked
  let getNotificationByEmail = currentUser.getNotificationByEmail;

  if (getNotificationByEmail === undefined) {
    getNotificationByEmail = true;
  }

  const updatedProps = {
    ...props,
    modules: notificationModulesQuery.notificationsModules,
    configs,
    saveNotificationConfigurations,

    getNotificationByEmail,
    configGetNotificationByEmail
  };

  return <NotificationSettings {...updatedProps} />;
};

NotificationSettingsContainer.propTypes = {
  currentUser: PropTypes.object,
  notificationModulesQuery: PropTypes.object,
  notificationConfigurationsQuery: PropTypes.object,
  configGetNotificationByEmailMutation: PropTypes.func,
  saveNotificationConfigurationsMutation: PropTypes.func
};

export default withCurrentUser(
  compose(
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
