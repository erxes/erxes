import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { MessengerConfigs } from '../components';
import { Loading } from '/imports/react-ui/common';

const MessengerConfigsContainer = props => {
  const { integrationDetailQuery } = props;

  if (integrationDetailQuery.loading) {
    return <Loading title="Integrations" spin />;
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
