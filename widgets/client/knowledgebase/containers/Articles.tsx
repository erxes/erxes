import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import DumbArticles from "../components/Articles";
import { connection } from "../connection";
import { IKbArticle } from "../types";
import { AppConsumer } from "./AppContext";
import queries from "./graphql";

type QueryResponse = {
  widgetsKnowledgeBaseArticles: IKbArticle[];
};

const Articles = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data || data.loading) {
    return null;
  }

  const extendedProps = {
    articles: data.widgetsKnowledgeBaseArticles || []
  };

  return <DumbArticles {...extendedProps} />;
};

const WithData = graphql<{ searchString: string }, QueryResponse>(
  gql(queries.kbSearchArticlesQuery),
  {
    options: ownProps => ({
      fetchPolicy: "network-only",
      variables: {
        topicId: connection.setting.topic_id,
        searchString: ownProps.searchString
      }
    })
  }
)(Articles);

const WithContext = () => (
  <AppConsumer>
    {({ searchString }) => <WithData searchString={searchString} />}
  </AppConsumer>
);

export default WithContext;
