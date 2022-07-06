import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { setLocale } from "../../utils";
import KnowledgeBase from "../components/KnowledgeBase";
import { connection } from "../connection";
import { IKbTopic } from "../types";
import { AppConsumer, AppProvider } from "./AppContext";
import queries from "./graphql";

import * as dayjs from "dayjs";
import * as localizedFormat from "dayjs/plugin/localizedFormat";
import * as relativeTime from "dayjs/plugin/relativeTime";

import "../sass/style.min.css";
import "../../sass/components/_faq-icons.scss";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

type QueryResponse = {
  widgetsKnowledgeBaseTopicDetail: IKbTopic;
};

const Topic = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data || data.loading || !data.widgetsKnowledgeBaseTopicDetail) {
    return null;
  }

  const {
    color,
    languageCode,
    backgroundImage
  } = data.widgetsKnowledgeBaseTopicDetail;

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
