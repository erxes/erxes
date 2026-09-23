import { useQuery } from '@apollo/client';
import { isUndefinedOrNull, useMultiQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { articlesTotalCountAtom } from '@/knowledgebase/articles/states/articlesTotalCountState';
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

  const { data, loading, error, refetch } = useQuery<IArticleListResponse>(
    ARTICLES,
    {
      skip: !topicId,
      variables: {
        topicIds: categoryId || !topicId ? undefined : [topicId],
        categoryIds: categoryId ? [categoryId] : undefined,
        searchValue,
        status,
        page: 1,
        perPage: ARTICLES_PER_PAGE,
      },
    },
  );

  const totalCount = data?.knowledgeBaseArticlesTotalCount;

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return {
    articles: data?.knowledgeBaseArticles,
    totalCount,
    loading,
    error,
    refetch,
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
