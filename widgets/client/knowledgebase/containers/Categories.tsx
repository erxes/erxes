import gql from "graphql-tag";
import * as React from "react";
import { ChildProps, graphql } from "react-apollo";
import { Categories as DumbCategories } from "../components";
import { connection } from "../connection";
import { IKbTopic } from "../types";
import queries from "./graphql";

const Categories = (props: ChildProps<{}, QueryResponse>) => {
  const { data } = props;

  if (!data) {
    return null;
  }
  if (data.loading) {
    return <div className="loader bigger top-space" />;
  }

  const extendedProps = {
    ...props,
    kbTopic: data.knowledgeBaseTopicDetail
  };

  return <DumbCategories {...extendedProps} />;
};

type QueryResponse = {
  knowledgeBaseTopicDetail: IKbTopic;
};

const CategoriesWithData = graphql<{}, QueryResponse>(
  gql(queries.getKbTopicQuery),
  {
    options: () => ({
      fetchPolicy: "network-only",
      variables: {
        _id: connection.setting.topic_id
      }
    })
  }
)(Categories);

export default CategoriesWithData;
