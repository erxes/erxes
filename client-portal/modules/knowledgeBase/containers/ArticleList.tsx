import { gql, useQuery } from "@apollo/client";
import React from "react";
import ArticleList from "../components/ArticleList";
import { articlesQuery } from "../graphql/queries";

type Props = {
  searchValue?: any;
  categoryId?: string;
};

function ArticleListContainer(props: Props) {
  const { loading, data = {} as any } = useQuery(gql(articlesQuery), {
    variables: {
      searchValue: props.searchValue || "",
      categoryIds: props.categoryId && [props.categoryId],
    },
  });

  const articles = data.knowledgeBaseArticles || [];

  const updatedProps = {
    ...props,
    loading,
    articles,
  };

  return <ArticleList {...updatedProps} />;
}

export default ArticleListContainer;
