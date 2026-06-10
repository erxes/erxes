import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_KNOWLEDGE_BASE_TOPIC_DETAILS } from '../graphql';
import { IKnowledgeBaseTopic } from '../types/knowledgeBase';

export const useGetKnowledgeBaseTopicDetails = (options: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{
    cpKnowledgeBaseTopicDetail: IKnowledgeBaseTopic;
  }>(GET_KNOWLEDGE_BASE_TOPIC_DETAILS, options);

  const { cpKnowledgeBaseTopicDetail } = data || {};
  const { parentCategories, categories, title } =
    cpKnowledgeBaseTopicDetail || {};

  return {
    details: cpKnowledgeBaseTopicDetail,
    parentCategories: parentCategories,
    categories: categories,
    title: title || 'Articles',
    loading,
    error,
  };
};
