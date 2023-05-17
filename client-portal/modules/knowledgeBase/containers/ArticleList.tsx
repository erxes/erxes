import { gql, useQuery } from "@apollo/client";

import ArticleList from "../components/ArticleList";
import { Config } from "../../types";
import React from "react";
import Spinner from "../../common/Spinner";
import { articlesQuery } from "../graphql/queries";

type Props = {
  config: Config;
  searchValue?: any;
  categoryId?: string;
  topicId?: string;
};

function ArticleListContainer(props: Props) {
  const { loading, data = {} as any } = useQuery(gql(articlesQuery), {
    variables: {
      searchValue: props.searchValue || "",
      categoryIds: props.categoryId && [props.categoryId],
      topicId: props.topicId || "",
    },
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  const articles = data.clientPortalKnowledgeBaseArticles || [];

  const updatedProps = {
    ...props,
    loading,
    articles,
  };

  const renderSearchResult = () => {
    const { searchValue } = props;

    if (!searchValue) {
      return null;
    }

    if (articles.length === 0) {
      return (
        <span className="search-result">
          We couldn't find any articles for: <b>{searchValue}</b>
        </span>
      );
    }

    return (
      <span className="search-result">
        Search result for: <b>{searchValue}</b>
      </span>
    );
  };

  return (
    <>
      {renderSearchResult()}
      <ArticleList {...updatedProps} />
    </>
  );
}

export default ArticleListContainer;
