import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { MessengerAppearance } from '../components';
import { Loading } from '/imports/react-ui/common';

const MessengerAppearanceContainer = props => {
  const { integrationDetailQuery } = props;

  if (integrationDetailQuery.loading) {
    return <Loading title="Integrations" spin />;
  }

  const integration = integrationDetailQuery.integrationDetail;

  const save = doc => {
    Meteor.call('integrations.saveMessengerApperance', { _id: integration._id, doc }, error => {
      if (error) return Alert.error(error.reason);

      return Alert.success('Successfully saved.');
    });
  };

  const updatedProps = {
    ...props,
    prevOptions: integration.uiOptions || {},
    save,
    user: Meteor.user(),
  };

  return <MessengerAppearance {...updatedProps} />;
};

MessengerAppearanceContainer.propTypes = {
  integrationDetailQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query integrationDetail($_id: String!) {
        integrationDetail(_id: $_id) {
          _id
          name
          uiOptions
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
)(MessengerAppearanceContainer);
