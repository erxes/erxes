import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { Notifier as DumbNotifier } from '../components';
import graphqlTypes from '../graphql';
import { connection } from '../connection';
import { AppConsumer } from './AppContext';
import NotificationSubscriber from './NotificationSubscriber';

class Notifier extends NotificationSubscriber {
  render() {
    if (this.props.data.loading) {
      return null;
    }

    const lastUnreadMessage = this.props.data.lastUnreadMessage;

    if (!lastUnreadMessage || !lastUnreadMessage._id) {
      return null;
    }

    return (
      <AppConsumer>
        {({ isMessengerVisible, readConversation, toggleNotifierFull, toggleNotifier }) => {
          const showUnreadMessage = () => {
            if (lastUnreadMessage._id) {
              const engageData = lastUnreadMessage.engageData;

              if (engageData && engageData.sentAs === 'fullMessage') {
                toggleNotifierFull();
              } else {
                toggleNotifier();
              }
            }
          }

          return (
            <DumbNotifier
              {...this.props}
              isMessengerVisible={isMessengerVisible}
              lastUnreadMessage={lastUnreadMessage}
              readConversation={readConversation}
              showUnreadMessage={showUnreadMessage}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const NotifierWithData = graphql(
  gql(graphqlTypes.lastUnreadMessage),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(Notifier);

export default NotifierWithData;
