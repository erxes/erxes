import gql from 'graphql-tag';
import * as React from 'react';
import DumpLauncher from '../components/Launcher';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { useQuery } from '@apollo/react-hooks';
import { useConversation } from '../context/Conversation';
import { getUiOptions } from '../utils/util';

const Launcher = () => {
  const {
    browserInfo,
    isBrowserInfoSaved,
    isMessengerVisible,
    unreadCount,
    setUnreadCount,
    toggle,
  } = useConversation();

  const { data, subscribeToMore, loading } = useQuery(
    gql(graphqlTypes.totalUnreadCountQuery),
    {
      variables: connection.data,
    }
  );

  React.useEffect(() => {
    if (data) {
      subscribeToMore({
        document: gql(graphqlTypes.adminMessageInserted),
        variables: { customerId: connection.data.customerId },
        updateQuery: (prev, { subscriptionData }) => {
          setUnreadCount(
            subscriptionData.data.conversationAdminMessageInserted.unreadCount
          );
        },
      });
    }
  }, [data, subscribeToMore]);

  React.useEffect(() => {
    if (data) {
      setUnreadCount(data.widgetsTotalUnreadCount || 0);
    }
  }, [data, setUnreadCount]);

  return (
    <DumpLauncher
      onClick={toggle}
      isMessengerVisible={isMessengerVisible}
      isBrowserInfoSaved={isBrowserInfoSaved}
      uiOptions={getUiOptions()}
      browserInfo={browserInfo}
      totalUnreadCount={unreadCount}
    />
  );
};

export default Launcher;
