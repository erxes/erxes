import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { queries } from '../../graphql';
import ArticleFilter from '../../components/filters/knowledgebaseFilter/ArticleFilter';

type Props = { categoryIds: string[]; queryParams: any;};

const ArticleFilterContainer = (props: Props) => {
  const { queryParams, categoryIds } = props;

  const knowledgeBaseArticles = useQuery(gql(queries.knowledgeBaseArticles), {
    variables: {
      categoryIds,
    },
  });

  const articles = (
    knowledgeBaseArticles?.data?.knowledgeBaseArticles || []
  ).filter(
    (article) => article.categoryId === queryParams.knowledgebaseCategoryId,
  );

  const updatedProps = {
    ...props,
    articles,
    loading: knowledgeBaseArticles.loading,
  };

  return <ArticleFilter {...updatedProps} />;
};

export default ArticleFilterContainer;
