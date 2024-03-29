import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { queries } from '../../graphql';
import client from '@erxes/ui/src/apolloClient';
import KnowledgebaseFilter from '../../components/filters/knowledgebaseFilter/KnowledgebaseFilter';

type Props = {
  queryParams: any;
};

const KnowledgebaseFilterContainer = (props: Props) => {
  const { queryParams } = props;

  const [articles, setArticles] = React.useState<any>([]);

  const knowledgeBaseTopics = useQuery(gql(queries.knowledgeBaseTopics));

  const loadArticles = (categoryIds: string[]) => {
    client
      .query({
        query: gql(queries.knowledgeBaseArticles),
        fetchPolicy: 'network-only',
        variables: { categoryIds },
      })
      .then(({ data }) => {
        const kbArticles = data.knowledgeBaseArticles || [];
        const articleIds = articles.map((article) => article._id);

        const uniqueArticles = kbArticles.filter(
          (kbArticle) => !articleIds.includes(kbArticle._id),
        );

        setArticles([...articles, ...uniqueArticles]);
      });
  };

  const updatedProps = {
    queryParams,
    knowledgeBaseTopics: knowledgeBaseTopics?.data?.knowledgeBaseTopics || [],
    loadArticles,
    loadedArticles: articles || [],
    loading: knowledgeBaseTopics.loading,
  };

  return <KnowledgebaseFilter {...updatedProps} />;
};

export default KnowledgebaseFilterContainer;
