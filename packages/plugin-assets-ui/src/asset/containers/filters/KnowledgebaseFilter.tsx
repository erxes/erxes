import React from 'react';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import client from '@erxes/ui/src/apolloClient';
import KnowledgebaseFilter from '../../components/filters/knowledgebaseFilter/KnowledgebaseFilter';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  knowledgeBaseTopics: any;
} & Props;

function KnowledgebaseFilterContainer({
  queryParams,
  history,
  knowledgeBaseTopics
}: FinalProps) {
  const [articles, setArticles] = React.useState<any>([]);

  const loadArticles = (categoryIds: string[]) => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: 'network-only',
        variables: { categoryIds }
      })
      .then(({ data }) => {
        const kbArticles = data.knowledgeBaseArticles || [];
        const articleIds = articles.map(article => article._id);

        const uniqueArticles = kbArticles.filter(
          kbArticle => !articleIds.includes(kbArticle._id)
        );

        setArticles([...articles, ...uniqueArticles]);
      });
  };

  const updatedProps = {
    queryParams,
    history,
    knowledgeBaseTopics: knowledgeBaseTopics.knowledgeBaseTopics || [],
    loadArticles,
    loadedArticles: articles,
    // selectedArticleIds: [...selectedArticleIds],
    loading: knowledgeBaseTopics.loading
  };

  return <KnowledgebaseFilter {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.knowledgeBaseTopics), {
      name: 'knowledgeBaseTopics'
    })
  )(KnowledgebaseFilterContainer)
);
