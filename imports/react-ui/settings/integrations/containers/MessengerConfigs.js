import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { MessengerConfigs } from '../components';

const MessengerConfigsContainer = props => {
  const { integrationDetailQuery } = props;

  if (integrationDetailQuery.loading) {
    return null;
  }

  const integration = integrationDetailQuery.integrationDetail;

  const save = doc => {
    Meteor.call('integrations.saveMessengerConfigs', { _id: integration._id, doc }, error => {
      if (error) return Alert.error(error.reason);

      return Alert.success('Successfully saved.');
    });
  };

  const updatedProps = {
    ...props,
    prevOptions: integration.messengerData || {},
    save,
    user: Meteor.user(),
  };

  return <MessengerConfigs {...updatedProps} />;
};

MessengerConfigsContainer.propTypes = {
  integrationDetailQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query integrationDetail($_id: String!) {
        integrationDetail(_id: $_id) {
          _id
          name
          messengerData
        }
      }
    `,
    {
      name: 'integrationDetailQuery',
      options: ({ integrationId }) => ({
        variables: {
          _id: integrationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(MessengerConfigsContainer);
