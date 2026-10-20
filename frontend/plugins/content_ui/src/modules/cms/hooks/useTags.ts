import { ApolloError, useQuery } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Cursor_Mode } from '~/gql/graphql';
import { CMS_TAGS } from '../graphql/queries';
import { cmsLanguageAtom } from '../shared/states/cmsLanguageState';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { TAGS_CURSOR_SESSION_KEY } from '../tags/constants/tagsCursorSessionKey';
import { tagsTotalCountAtom } from '../tags/states/tagsCounts';
import { CmsTag } from '../tags/types/tagTypes';
import {
  compactList,
  mergeCursorPage,
  toCursorPageInfo,
} from '../shared/utils';

export interface UseTagsProps {
  clientPortalId?: string;
  searchValue?: string;
  cursor?: string;
  limit?: number;
  fetchAll?: boolean;
  cursorMode?: Cursor_Mode;
  direction?: 'forward' | 'backward';
  sortField?: string;
  sortMode?: string;
  sortDirection?: string;
  skip?: boolean;
}

interface UseTagsResult {
  tags: CmsTag[];
  totalCount: number;
  pageInfo?: IRecordTableCursorPageInfo;
  loading: boolean;
  error?: ApolloError;
  refetch: () => void;
  handleFetchMore: ({ direction }: { direction: EnumCursorDirection }) => void;
}

export const TAGS_PER_PAGE = 30;

export function useTags({
  clientPortalId,
  searchValue,
  cursor,
  limit = TAGS_PER_PAGE,
  fetchAll = false,
  cursorMode,
  direction,
  sortField,
  sortMode,
  sortDirection,
  skip = false,
}: UseTagsProps): UseTagsResult {
  const language = useAtomValue(cmsLanguageAtom);
  const setTagsTotalCount = useSetAtom(tagsTotalCountAtom);
  const fetchedCursorsRef = useRef<Set<string>>(new Set());
  const fetchingMoreRef = useRef(false);
  const { cursor: tableCursor } = useRecordTableCursor({
    sessionKey: TAGS_CURSOR_SESSION_KEY,
  });

  const variables = useMemo(
    () => ({
      clientPortalId,
      searchValue,
      cursor: cursor ?? (fetchAll ? undefined : tableCursor),
      limit,
      cursorMode,
      direction,
      sortField: sortField || 'createdAt',
      sortMode,
      sortDirection: sortDirection || '-1',
      language,
    }),
    [
      clientPortalId,
      searchValue,
      cursor,
      tableCursor,
      limit,
      fetchAll,
      cursorMode,
      direction,
      sortField,
      sortMode,
      sortDirection,
      language,
    ],
  );

  const { data, loading, error, refetch, fetchMore } = useQuery(CMS_TAGS, {
    variables,
    skip,
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    fetchedCursorsRef.current.clear();
  }, [variables]);

  useEffect(() => {
    if (!skip) return;

    fetchedCursorsRef.current.clear();
    fetchingMoreRef.current = false;
  }, [skip]);

  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.cmsTags?.pageInfo),
    [data?.cmsTags?.pageInfo],
  );

  const fetchRemainingTags = useCallback(async () => {
    const endCursor = pageInfo?.endCursor;

    if (
      !pageInfo?.hasNextPage ||
      !endCursor ||
      fetchingMoreRef.current ||
      fetchedCursorsRef.current.has(endCursor)
    ) {
      return;
    }

    fetchingMoreRef.current = true;
    fetchedCursorsRef.current.add(endCursor);

    try {
      await fetchMore({
        variables: {
          ...variables,
          cursor: endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.cmsTags) {
            return prev;
          }

          return {
            ...prev,
            cmsTags: {
              ...fetchMoreResult.cmsTags,
              tags: [
                ...(prev.cmsTags?.tags || []),
                ...(fetchMoreResult.cmsTags.tags || []),
              ],
            },
          };
        },
      });
    } finally {
      fetchingMoreRef.current = false;
    }
  }, [fetchMore, pageInfo?.endCursor, pageInfo?.hasNextPage, variables]);

  useEffect(() => {
    if (!fetchAll || skip) return;
    fetchRemainingTags();
  }, [fetchAll, fetchRemainingTags, skip]);

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (
        fetchAll ||
        !validateFetchMore({
          direction,
          pageInfo,
        })
      ) {
        return;
      }

      fetchMore({
        variables: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: TAGS_PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult.cmsTags || !prev.cmsTags) return prev;

          const merged = mergeCursorPage(
            direction,
            { list: prev.cmsTags.tags, pageInfo: prev.cmsTags.pageInfo },
            {
              list: fetchMoreResult.cmsTags.tags,
              pageInfo: fetchMoreResult.cmsTags.pageInfo,
            },
          );

          return {
            ...prev,
            cmsTags: {
              ...fetchMoreResult.cmsTags,
              tags: merged.list,
              pageInfo: merged.pageInfo,
            },
          };
        },
      });
    },
    [fetchAll, fetchMore, pageInfo, variables],
  );

  const refetchTags = useCallback(() => {
    fetchedCursorsRef.current.clear();
    return refetch(variables);
  }, [refetch, variables]);

  const tags = useMemo(
    () => compactList(data?.cmsTags?.tags),
    [data?.cmsTags?.tags],
  );
  const totalCount = data?.cmsTags?.totalCount || 0;

  useEffect(() => {
    setTagsTotalCount(null);
  }, [variables, setTagsTotalCount]);

  useEffect(() => {
    if (skip) return;
    setTagsTotalCount(data?.cmsTags?.totalCount ?? null);
  }, [skip, data?.cmsTags?.totalCount, setTagsTotalCount]);

  return {
    tags,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch: refetchTags,
    handleFetchMore,
  };
}
