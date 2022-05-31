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
  const { loading, data = {} as any } =
    id || ({} as any)
      ? useQuery(gql(articleDetailQuery), {
          variables: { _id: id || "" },
          skip: !id,
        })
      : { loading: true };

  const { data: catData = {} as any } =
    catId ||
    (({} as any) &&
      useQuery(gql(categoryDetailQuery), {
        variables: { _id: catId || "" },
        skip: !catId,
      }));

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
