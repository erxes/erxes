import * as React from "react";

import { toggleNotifier, toggleNotifierFull } from "../utils/util";

import DumbNotifier from "../components/Notifier";
import { IBrowserInfo } from "../../types";
import { connection } from "../connection";
import { getEngageMessage } from "../graphql/queries";
import gql from "graphql-tag";
import { useConversation } from "../context/Conversation";
import { useQuery } from "@apollo/react-hooks";

type Props = {
  browserInfo?: IBrowserInfo;
};

const Notifier = ({ browserInfo }: Props) => {
  const { readConversation } = useConversation();

  const { data: engageMessageQuery, loading } = useQuery(
    gql(getEngageMessage),
    {
      skip: !connection.data.customerId || !connection.enabledServices?.engage, // it should be "engages"
      variables: {
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        browserInfo: browserInfo,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
      // every minute
      pollInterval: 60000,
    }
  );

  const showUnreadMessage = () => {
    if (message._id) {
      const { engageData } = message;

      if (engageData && engageData.sentAs === "fullMessage") {
        toggleNotifierFull();
      } else {
        toggleNotifier();
      }
    }
  };

  if (loading) {
    return null;
  }
  const message = engageMessageQuery?.widgetsGetEngageMessage;

  if (!message || !message._id) {
    return null;
  }
  return (
    <DumbNotifier
      message={message}
      readConversation={readConversation}
      showUnreadMessage={showUnreadMessage}
      toggleNotifier={toggleNotifier}
    />
  );
};

export default Notifier;
