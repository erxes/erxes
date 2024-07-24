import gql from 'graphql-tag';
import * as React from 'react';
import DumbArticles from '../../components/faq/Articles';
import queries from '../../graphql';
import { IFaqArticle } from '../../types';
import { useQuery } from '@apollo/client';

type Props = {
  topicId?: string;
  searchString?: string;
  articles?: IFaqArticle[];
};

const Articles = (props: Props) => {
  const { topicId, searchString, articles } = props;

  // const { data, loading, error } = useQuery(
  //   gql(queries.faqSearchArticlesQuery),
  //   {
  //     fetchPolicy: 'network-only',
  //     variables: {
  //       topicId,
  //       searchString,
  //     },
  //   }
  // );

  return (
    <DumbArticles
      articles={articles || []}
      // articles={articles || data?.widgetsKnowledgeBaseArticles}
      // loading={loading}
    />
  );
};

export default Articles;
