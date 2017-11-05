import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { withCurrentUser } from 'modules/auth/containers';
import { Alert } from 'modules/common/utils';
import { NotificationSettings } from '../components';

const NotificationSettingsContainer = props => {
  const { currentUser, configGetNotificationByEmailMutation } = props;

  const configGetNotificationByEmail = variables => {
    configGetNotificationByEmailMutation({ variables })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.success(error.message);
      });
  };

  // default value is checked
  let getNotificationByEmail = currentUser.getNotificationByEmail;

  if (getNotificationByEmail === undefined) {
    getNotificationByEmail = true;
  }

  const updatedProps = {
    ...props,

    // TODO
    modules: [],
    configs: [],
    save: () => {},

    getNotificationByEmail,
    configGetNotificationByEmail
  };

  return <NotificationSettings {...updatedProps} />;
};

NotificationSettingsContainer.propTypes = {
  currentUser: PropTypes.object,
  configGetNotificationByEmailMutation: PropTypes.func
};

export default withCurrentUser(
  compose(
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
    )
  )(NotificationSettingsContainer)
);
