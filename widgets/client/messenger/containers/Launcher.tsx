import * as React from "react";

import DumpLauncher from "../components/Launcher";
import { adminMessageInserted } from "../graphql/subscriptions";
import { connection } from "../connection";
import { getUiOptions } from "../utils/util";
import gql from "graphql-tag";
import { totalUnreadCountQuery } from "../graphql/queries";
import { useConversation } from "../context/Conversation";
import { useQuery } from "@apollo/react-hooks";

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
    gql(totalUnreadCountQuery),
    {
      variables: connection.data,
    }
  );

  React.useEffect(() => {
    if (data) {
      subscribeToMore({
        document: gql(adminMessageInserted),
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
