import * as compose from 'lodash.flowright';

import { isEnabled, sendDesktopNotification } from '@erxes/ui/src/utils/core';
import { queries, subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';

import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { UnreadConversationsTotalCountQueryResponse } from '@erxes/ui-inbox/src/inbox/types';
import UnreadCount from '../components/UnreadCount';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import strip from 'strip';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { withProps, getSubdomain } from '@erxes/ui/src/utils';

type Props = {
  currentUser: IUser;
};

type FinalProps = {
  unreadConversationsCountQuery: UnreadConversationsTotalCountQueryResponse;
} & Props;

class UnreadCountContainer extends React.Component<FinalProps> {
  componentWillMount() {
    const { unreadConversationsCountQuery, currentUser } = this.props;

    unreadConversationsCountQuery &&
      unreadConversationsCountQuery.subscribeToMore({
        // listen for all conversation changes
        document: gql(subscriptions.conversationClientMessageInserted),
        variables: { subdomain: getSubdomain(), userId: currentUser._id },
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
    const { unreadConversationsCountQuery } = this.props;

    const unreadConversationsCount =
      (unreadConversationsCountQuery &&
        unreadConversationsCountQuery.conversationsTotalUnreadCount) ||
      0;

    const props = {
      ...this.props,
      unreadConversationsCount
    };

    return <UnreadCount {...props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, UnreadConversationsTotalCountQueryResponse>(
      gql(queries.unreadConversationsCount),
      {
        name: 'unreadConversationsCountQuery',
        options: () => ({
          fetchPolicy: 'network-only',
          notifyOnNetworkStatusChange: true
        }),
        skip: !isEnabled('inbox') ? true : false
      }
    )
  )(withCurrentUser(UnreadCountContainer))
);
