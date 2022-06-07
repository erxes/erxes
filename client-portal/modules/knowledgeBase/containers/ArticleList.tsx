import { gql, useQuery } from "@apollo/client";
import React from "react";
import Spinner from "../../common/Spinner";
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

  if (loading) {
    return <Spinner objective={true} />;
  }

  const articles = data.knowledgeBaseArticles || [];

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
