import { useQuery } from '@apollo/client';
import { FRONTLINE_AI_KNOWLEDGE_TOPICS } from '../graphql/queries';

type TKnowledgeCategoryOption = {
  _id: string;
  title?: string;
  parentCategoryId?: string | null;
};

type TKnowledgeTopicOption = {
  _id: string;
  title?: string;
  categories?: TKnowledgeCategoryOption[] | null;
};

export type TKnowledgeCategoryNode = {
  _id: string;
  title: string;
  children: TKnowledgeCategoryNode[];
};

export type TKnowledgeTopicNode = {
  _id: string;
  title: string;
  categories: TKnowledgeCategoryNode[];
};

const buildCategoryTree = (
  categories: TKnowledgeCategoryOption[],
): TKnowledgeCategoryNode[] => {
  const ids = new Set(categories.map(({ _id }) => _id));
  const childrenByParent = new Map<string, TKnowledgeCategoryOption[]>();

  for (const category of categories) {
    // A parent outside this topic leaves the category at the top level.
    const parentId =
      category.parentCategoryId && ids.has(category.parentCategoryId)
        ? category.parentCategoryId
        : '';
    childrenByParent.set(parentId, [
      ...(childrenByParent.get(parentId) || []),
      category,
    ]);
  }

  const toNodes = (parentId: string): TKnowledgeCategoryNode[] =>
    (childrenByParent.get(parentId) || []).map((category) => ({
      _id: category._id,
      title: category.title || '',
      children: toNodes(category._id),
    }));

  return toNodes('');
};

export const useKnowledgeTopicTree = () => {
  const { data, loading, error } = useQuery<{
    knowledgeBaseTopics?: TKnowledgeTopicOption[];
  }>(FRONTLINE_AI_KNOWLEDGE_TOPICS, { variables: { perPage: 100 } });

  const topics: TKnowledgeTopicNode[] = (data?.knowledgeBaseTopics || []).map(
    (topic) => ({
      _id: topic._id,
      title: topic.title || '',
      categories: buildCategoryTree(topic.categories || []),
    }),
  );

  return { topics, loading, error };
};
