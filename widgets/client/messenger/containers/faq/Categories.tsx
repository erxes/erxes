import gql from 'graphql-tag';
import * as React from 'react';
import Categories from '../../components/faq/Categories';
import queries from '../../graphql';
import { IFaqTopic } from '../../types';
import Articles from './Articles';
import { useQuery } from '@apollo/client';

type Props = {
  topicId?: string;
  searchString: string;
};

const CategoriesContainer = (props: Props) => {
  const { data, loading } = useQuery(gql(queries.getFaqTopicQuery), {
    fetchPolicy: 'cache-and-network',
    variables: {
      _id: props.topicId,
    },
  });

  if (!data) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading: loading,
    faqTopics: data.knowledgeBaseTopicDetail,
  };

  if (props.searchString) {
    return <Articles {...props} />;
  }

  return <Categories {...extendedProps} />;
};

// type QueryResponse = {
//   knowledgeBaseTopicDetail: IFaqTopic;
// };

export default CategoriesContainer;
