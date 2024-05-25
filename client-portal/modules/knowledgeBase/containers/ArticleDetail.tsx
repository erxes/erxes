import { gql, useQuery } from "@apollo/client";
import React from "react";
import ArticleDetail from "../components/ArticleDetail";
import { articleDetailQuery, categoryDetailQuery } from "../graphql/queries";
import { AppConsumer } from "../../appContext";
import { Store } from "../../types";

type Props = {
  queryParams: any;
};

function ArticleDetailContainer({
  queryParams: { id, catId },
  ...props
}: Props) {
  let queryOptions = {};
  if (id) {
    queryOptions = {
      variables: { _id: id },
      skip: false,
    };
  } else {
    queryOptions = { loading: true };
  }
  
  const { loading, data = {} as any } = useQuery(gql(articleDetailQuery), queryOptions);
  

  let queryOptions1 = {};
  if (catId) {
    queryOptions1 = {
      variables: { _id: catId },
      skip: false,
    };
  } else {
    queryOptions1 = { skip: true };
  }
  
  const { data: catData = {} as any } = useQuery(gql(categoryDetailQuery), queryOptions1);
  

  const article = (data && data.knowledgeBaseArticleDetail) || {};
  const category = (catData && catData.knowledgeBaseCategoryDetail) || {};

  const updatedProps = {
    ...props,
    loading,
    article,
    category,
  };

  return (
    <AppConsumer>
      {({ topic, config }: Store) => {
        return (
          <ArticleDetail {...updatedProps} topic={topic} config={config} />
        );
      }}
    </AppConsumer>
  );
}

export default ArticleDetailContainer;
