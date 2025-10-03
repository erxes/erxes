import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';

import { TAG_BADGE_QUERY, TAGS_QUERY } from '../graphql/queries/tagsQueries';
import { ITag } from 'ui-modules/modules';
import { ICursorListResponse, EnumCursorDirection } from 'erxes-ui';

const TAGS_PER_PAGE = 20;

export const useTags = (
  options?: QueryHookOptions<ICursorListResponse<ITag>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<ITag>
  >(TAGS_QUERY, {
    ...options,
  });
  const { list: tags, totalCount = 0, pageInfo } = data?.tags || {};

  const handleFetchMore = () => {
    if (totalCount <= (tags?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: TAGS_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          tags: {
            list: [...(prev.tags?.list || []), ...fetchMoreResult.tags.list],
            totalCount: fetchMoreResult.tags.totalCount,
            pageInfo: fetchMoreResult.tags.pageInfo,
          },
        });
      },
    });
  };

  const tagsWithHasChildren = tags?.map((tag) => ({
    ...tag,
    hasChildren: tags?.some((t) => t.parentId === tag._id),
  }));

  return {
    tags: tagsWithHasChildren,
    sortedTags: [...(tagsWithHasChildren || [])].sort((a, b) =>
      (a.order || '').localeCompare(b.order || ''),
    ),
    pageInfo,
    totalCount,
    loading,
    error,
    handleFetchMore,
  };
};

export const useTagsByIds = (options: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    tagDetail: ITag;
  }>(TAG_BADGE_QUERY, {
    ...options,
  });

  const { tagDetail } = data || {};

  return {
    tagDetail,
    loading,
    error,
  };
};
