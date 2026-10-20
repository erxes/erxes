import { useQuery } from '@apollo/client';
import { isDefined, isUndefinedOrNull, useMultiQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { articlesTotalCountAtom } from '@/knowledgebase/articles/states/articlesTotalCountState';
import { ARTICLES_PER_PAGE } from '@/knowledgebase/constants';
import { ARTICLE_DETAIL, ARTICLES } from '@/knowledgebase/graphql/queries';

export interface IArticleFilters {
  searchValue?: string;
  categoryId?: string;
  status?: string;
}

export const useArticleFilters = (): IArticleFilters => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    categoryId: string;
    status: string;
  }>(['searchValue', 'categoryId', 'status']);

  const { searchValue, categoryId, status } = queries || {};

  return {
    searchValue: searchValue || undefined,
    categoryId: categoryId || undefined,
    status: status || undefined,
  };
};

export const articlesQueryVariables = (
  topicId?: string,
  { searchValue, categoryId, status }: IArticleFilters = {},
) => ({
  topicIds: categoryId || !topicId ? undefined : [topicId],
  categoryIds: categoryId ? [categoryId] : undefined,
  searchValue,
  status,
  page: 1,
  perPage: ARTICLES_PER_PAGE,
});

export const useArticles = (topicId?: string) => {
  const setTotalCount = useSetAtom(articlesTotalCountAtom);
  const filters = useArticleFilters();

  const { data, loading, error, refetch } = useQuery(ARTICLES, {
    skip: !topicId,
    variables: articlesQueryVariables(topicId, filters),
  });

  const totalCount = data?.knowledgeBaseArticlesTotalCount;

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  const articles = useMemo(
    () => data?.knowledgeBaseArticles?.filter(isDefined),
    [data?.knowledgeBaseArticles],
  );

  return {
    articles,
    totalCount,
    loading,
    error,
    refetch,
  };
};

export const useArticleDetail = (articleId?: string | null) => {
  const { data, loading, error } = useQuery(ARTICLE_DETAIL, {
    variables: articleId ? { _id: articleId } : undefined,
    skip: !articleId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    article: data?.knowledgeBaseArticleDetail ?? undefined,
    loading,
    error,
  };
};
