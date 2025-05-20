import * as React from "react";

import DumbConversationList from "../components/ConversationInit";
import { allConversations } from "../graphql/queries";
import { connection } from "../connection";
import { getMessengerData } from "../utils/util";
import gql from "graphql-tag";
import { useConversation } from "../context/Conversation";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "../context/Router";

const ConversationInit = () => {
  const { setRoute } = useRouter();
  const { goToConversation, createConversation } = useConversation();
  const { data, loading } = useQuery(gql(allConversations), {
    fetchPolicy: "network-only",
    variables: connection.data,
    notifyOnNetworkStatusChange: true,
    // every minute
    pollInterval: connection.setting.pollInterval || 0,
  });

  const { responseRate } = getMessengerData();

  const goToAllConversations = () => {
    setRoute("allConversations");
  };

  return (
    <DumbConversationList
      loading={loading}
      conversations={data?.widgetsConversations || []}
      goToConversation={goToConversation}
      createConversation={createConversation}
      goToAllConversations={goToAllConversations}
      responseRate={responseRate}
    />
  );
};

export default ConversationInit;
