import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_KNOWLEDGE_BASE_TOPIC_DETAILS } from '../graphql';
import { IKnowledgeBaseTopic } from '../types/knowledgeBase';

export const useGetKnowledgeBaseTopicDetails = (options: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{
    knowledgeBaseTopicDetail: IKnowledgeBaseTopic;
  }>(GET_KNOWLEDGE_BASE_TOPIC_DETAILS, options);

  const { knowledgeBaseTopicDetail } = data || {};
  const { parentCategories, categories, title } =
    knowledgeBaseTopicDetail || {};

  return {
    details: knowledgeBaseTopicDetail,
    parentCategories: parentCategories,
    categories: categories,
    title: title || 'Articles',
    loading,
    error,
  };
};
