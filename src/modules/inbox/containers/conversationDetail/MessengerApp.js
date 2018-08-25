import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { MessengerApp } from 'modules/inbox/components/conversationDetail';
import { queries } from 'modules/inbox/graphql';

const MessengerAppContainer = props => {
  const { messengerAppsQuery } = props;

  if (messengerAppsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    messengerApps: messengerAppsQuery.messengerApps
  };

  return <MessengerApp {...updatedProps} />;
};

MessengerAppContainer.propTypes = {
  messengerAppsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.messengerApps), {
    name: 'messengerAppsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(MessengerAppContainer);
