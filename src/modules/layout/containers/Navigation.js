import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Navigation } from '../components';
import { subscriptions, queries } from 'modules/inbox/graphql';

class NavigationContainer extends React.Component {
  componentWillMount() {
    this.props.unreadConversationsCountQuery.subscribeToMore({
      // listen for all conversation changes
      document: gql(subscriptions.conversationClientMessageInserted),

      updateQuery: () => {
        this.props.unreadConversationsCountQuery.refetch();
      }
    });
  }

  render() {
    const { unreadConversationsCountQuery } = this.props;
    const unreadConversationsCount =
      unreadConversationsCountQuery.conversationsTotalUnreadCount || 0;

    const props = {
      unreadConversationsCount
    };

    return <Navigation {...props} />;
  }
}

NavigationContainer.propTypes = {
  unreadConversationsCountQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.unreadConversationsCount), {
    name: 'unreadConversationsCountQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  })
)(NavigationContainer);
