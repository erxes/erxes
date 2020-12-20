import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { queries, subscriptions } from 'modules/inbox/graphql';
import { UnreadConversationsTotalCountQueryResponse } from 'modules/inbox/types';
import React from 'react';
import { graphql } from 'react-apollo';
import strip from 'strip';
import { sendDesktopNotification, withProps } from '../../common/utils';
import Navigation from '../components/Navigation';

class NavigationContainer extends React.Component<{
  unreadConversationsCountQuery: UnreadConversationsTotalCountQueryResponse;
  currentUser: IUser;
  plugins?;
}> {
  componentWillMount() {
    const { unreadConversationsCountQuery, currentUser } = this.props;

    unreadConversationsCountQuery.subscribeToMore({
      // listen for all conversation changes
      document: gql(subscriptions.conversationClientMessageInserted),
      variables: { userId: currentUser._id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const { conversationClientMessageInserted } = data;
        const { content } = conversationClientMessageInserted;

        this.props.unreadConversationsCountQuery.refetch();

        // no need to send notification for bot message
        sendDesktopNotification({
          title: 'You have a new message',
          content: strip(content || '')
        });
      }
    });
  }

  render() {
    const { unreadConversationsCountQuery, plugins } = this.props;
    const unreadConversationsCount =
      unreadConversationsCountQuery.conversationsTotalUnreadCount || 0;

    const props = {
      unreadConversationsCount,
      plugins
    };

    return <Navigation {...props} />;
  }
}

export default withProps<{ currentUser: IUser, plugins }>(
  compose(
    graphql<{}, UnreadConversationsTotalCountQueryResponse>(
      gql(queries.unreadConversationsCount),
      {
        name: 'unreadConversationsCountQuery',
        options: () => ({
          fetchPolicy: 'network-only',
          notifyOnNetworkStatusChange: true
        })
      }
    )
  )(NavigationContainer)
);
