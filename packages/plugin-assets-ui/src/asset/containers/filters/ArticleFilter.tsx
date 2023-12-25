import React from 'react';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import ArticleFilter from '../../components/filters/knowledgebaseFilter/ArticleFilter';

type Props = { categoryIds: string[]; queryParams: any; history: any };

type FinalProps = {
  knowledgeBaseArticles: any;
} & Props;

function ArticleFilterContainer(props: FinalProps) {
  const { knowledgeBaseArticles, queryParams } = props;

  const articles = (knowledgeBaseArticles?.knowledgeBaseArticles || []).filter(
    article => article.categoryId === queryParams.knowledgebaseCategoryId
  );

  const updatedProps = {
    ...props,
    articles,
    loading: knowledgeBaseArticles.loading
  };

  return <ArticleFilter {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.knowledgeBaseArticles), {
      name: 'knowledgeBaseArticles',
      options: ({ categoryIds }) => ({
        variables: {
          categoryIds
        }
      })
    })
  )(ArticleFilterContainer)
);
