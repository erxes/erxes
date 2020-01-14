import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { setLocale } from "../../utils";
import { KnowledgeBase } from "../components";
import { connection } from "../connection";
import { IKbTopic } from "../types";
import { AppConsumer, AppProvider } from "./AppContext";
import queries from "./graphql";

type QueryResponse = {
  knowledgeBaseTopicDetail: IKbTopic;
};

const Topic = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data || data.loading || !data.knowledgeBaseTopicDetail) {
    return null;
  }

  const {
    color,
    languageCode,
    backgroundImage
  } = data.knowledgeBaseTopicDetail;

  // set language
  setLocale(languageCode);

  return (
    <AppProvider>
      <AppConsumer>
        {({ activeRoute }) => {
          return (
            <KnowledgeBase
              {...props}
              color={color}
              backgroundImage={backgroundImage}
              activeRoute={activeRoute}
            />
          );
        }}
      </AppConsumer>
    </AppProvider>
  );
};

const TopicWithData = graphql<{}, QueryResponse>(gql(queries.getKbTopicQuery), {
  options: () => ({
    fetchPolicy: "network-only",
    variables: {
      _id: connection.setting.topic_id
    }
  })
})(Topic);

export default TopicWithData;
