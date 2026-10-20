import { AutomationAiKnowledgeSourceSelectorProps } from 'ui-modules';

type TKnowledgeScope = {
  topicIds: string[];
  categoryIds: string[];
  articleIds: string[];
};

const toIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const toggleId = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];

export const useKnowledgeScopeSelection = ({
  value,
  config,
  onChange,
}: Pick<
  AutomationAiKnowledgeSourceSelectorProps,
  'value' | 'config' | 'onChange'
>) => {
  const topicIds = toIds(config?.topicIds);
  const categoryIds = toIds(config?.categoryIds);
  const hasRules = topicIds.length > 0 || categoryIds.length > 0;
  // With a topic or category rule the source is indexed whole and filtered,
  // so hand-picked articles travel inside the rule instead of as source ids.
  const articleIds = hasRules ? toIds(config?.articleIds) : value;
  const current: TKnowledgeScope = { topicIds, categoryIds, articleIds };

  const emit = (next: TKnowledgeScope) => {
    if (next.topicIds.length || next.categoryIds.length) {
      onChange([], next);
      return;
    }

    onChange(next.articleIds, {});
  };

  return {
    topicIds,
    categoryIds,
    articleIds,
    hasRules,
    toggleTopic: (topicId: string) =>
      emit({ ...current, topicIds: toggleId(topicIds, topicId) }),
    toggleCategory: (categoryId: string) =>
      emit({ ...current, categoryIds: toggleId(categoryIds, categoryId) }),
    toggleArticle: (articleId: string) =>
      emit({ ...current, articleIds: toggleId(articleIds, articleId) }),
    setArticleIds: (nextArticleIds: string[]) =>
      emit({ ...current, articleIds: nextArticleIds }),
  };
};
