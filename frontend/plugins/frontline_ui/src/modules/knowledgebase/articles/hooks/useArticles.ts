import { useQuery } from '@apollo/client';
import { isUndefinedOrNull, useMultiQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { articlesTotalCountAtom } from '@/knowledgebase/articles/states/articlesTotalCountState';
import { useCategories } from '@/knowledgebase/categories/hooks/useCategories';
import { getCategoryWithDescendantIds } from '@/knowledgebase/categories/utils/sortCategoriesAsTree';
import { ARTICLES_PER_PAGE } from '@/knowledgebase/constants';
import { ARTICLE_DETAIL, ARTICLES } from '@/knowledgebase/graphql/queries';
import {
  IArticleDetailResponse,
  IArticleListResponse,
} from '@/knowledgebase/types';

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

export const useArticles = (topicId?: string) => {
  const setTotalCount = useSetAtom(articlesTotalCountAtom);
  const { searchValue, categoryId, status } = useArticleFilters();
  const { categories } = useCategories(topicId);

  const [fetchingMore, setFetchingMore] = useState(false);

  const categoryIds = useMemo(
    () =>
      categoryId && categories
        ? getCategoryWithDescendantIds(categories, categoryId)
        : undefined,
    [categories, categoryId],
  );

  const { data, loading, error, refetch, fetchMore } =
    useQuery<IArticleListResponse>(ARTICLES, {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      skip: !topicId || (!!categoryId && !categoryIds),
      variables: {
        topicIds: categoryId || !topicId ? undefined : [topicId],
        categoryIds,
        searchValue,
        status,
        page: 1,
        perPage: ARTICLES_PER_PAGE,
      },
    });

  const articles = data?.knowledgeBaseArticles;
  const totalCount = data?.knowledgeBaseArticlesTotalCount;
  const hasMore =
    !!articles &&
    !isUndefinedOrNull(totalCount) &&
    articles.length < totalCount;

  const handleFetchMore = async () => {
    if (!articles || !hasMore || fetchingMore) return;

    setFetchingMore(true);

    try {
      await fetchMore({
        variables: {
          page: Math.floor(articles.length / ARTICLES_PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          const loadedIds = new Set(
            prev.knowledgeBaseArticles.map((article) => article._id),
          );

          return {
            ...prev,
            knowledgeBaseArticles: [
              ...prev.knowledgeBaseArticles,
              ...fetchMoreResult.knowledgeBaseArticles.filter(
                (article) => !loadedIds.has(article._id),
              ),
            ],
          };
        },
      });
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return {
    articles,
    totalCount,
    loading,
    error,
    refetch,
    hasMore,
    fetchingMore,
    handleFetchMore,
  };
};

export const useArticleDetail = (articleId?: string | null) => {
  const { data, loading, error } = useQuery<IArticleDetailResponse>(
    ARTICLE_DETAIL,
    {
      variables: { _id: articleId },
      skip: !articleId,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    article: data?.knowledgeBaseArticleDetail,
    loading,
    error,
  };
};
