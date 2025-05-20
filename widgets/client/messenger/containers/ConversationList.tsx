import * as React from "react";

import ConversationList from "../components/ConversationList";
import { allConversations } from "../graphql/queries";
import { connection } from "../connection";
import gql from "graphql-tag";
import { useConversation } from "../context/Conversation";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "../context/Router";

const ConversationListContainer = ({ loading }: { loading: boolean }) => {
  const { setRoute } = useRouter();
  const { goToConversation, createConversation } = useConversation();

  const goToHome = () => {
    setRoute("home");
  };

  const { data, loading: loadingConversations } = useQuery(
    gql(allConversations),
    {
      fetchPolicy: "network-only",
      variables: connection.data,
    }
  );

  return (
    <ConversationList
      loading={loading || loadingConversations}
      conversations={data?.widgetsConversations || []}
      goToConversation={goToConversation}
      createConversation={createConversation}
      goToHome={goToHome}
    />
  );
};

export default ConversationListContainer;
