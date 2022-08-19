import { gql, useQuery } from "@apollo/client";
import React, { createContext } from "react";
import { Config, UserQueryResponse } from "./types";
import { currentUser } from "./user/graphql/queries";
import { clientPortalGetConfig } from "./main/graphql/queries";
import { getKbTopicQuery } from "./knowledgeBase/graphql/queries";

const AppContext = createContext({});

export const AppConsumer = AppContext.Consumer;

type Props = {
  children: any;
};

function AppProvider({ children }: Props) {
  const { data } = useQuery<UserQueryResponse>(gql(currentUser));

  const response: any = useQuery(gql(clientPortalGetConfig), {});

  const config: Config = response.data
    ? response.data.clientPortalGetConfigByDomain
    : {};

  const topicResponse = useQuery(gql(getKbTopicQuery), {
    variables: {
      _id: config.knowledgeBaseTopicId,
    },
    skip: !config.knowledgeBaseTopicId,
  });

  const topic =
    (topicResponse.data
      ? topicResponse.data.clientPortalKnowledgeBaseTopicDetail
      : {}) || {};

  return (
    <AppContext.Provider
      value={{
        config,
        currentUser: (data || {}).clientPortalCurrentUser,
        topic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;
