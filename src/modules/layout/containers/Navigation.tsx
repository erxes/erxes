import gql from 'graphql-tag';
import { queries, subscriptions } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Navigation } from '../components';

class NavigationContainer extends React.Component<{
  unreadConversationsCountQuery: any;
}> {
  componentWillMount() {
    this.props.unreadConversationsCountQuery.subscribeToMore({
      // listen for all conversation changes
      document: gql(subscriptions.conversationClientMessageInserted),

      updateQuery: () => {
        this.props.unreadConversationsCountQuery.refetch();

        // notify by sound
        const audio = new Audio('/sound/notify.mp3');
        audio.play();
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

export default compose(
  graphql(gql(queries.unreadConversationsCount), {
    name: 'unreadConversationsCountQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  })
)(NavigationContainer);
