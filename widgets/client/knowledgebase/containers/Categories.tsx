import * as React from 'react';
import DumbCategories from '../components/Categories';
import { connection } from '../connection';
import queries from './graphql';
import { gql, useQuery } from '@apollo/client';

const Categories = () => {
  const { data, loading } = useQuery(gql(queries.getKbTopicQuery), {
    variables: {
      _id: connection.setting.topic_id,
    },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <div className="loader bigger top-space" />;
  }

  return <DumbCategories kbTopic={data?.widgetsKnowledgeBaseTopicDetail} />;
};

export default Categories;
