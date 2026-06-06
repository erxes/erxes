import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CMS_TAGS } from '../graphql/queries';
import { cmsLanguageAtom } from '../shared/states/cmsLanguageState';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { TAGS_CURSOR_SESSION_KEY } from '../tags/constants/tagsCursorSessionKey';

export interface CmsTag {
  _id: string;
  name: string;
  slug: string;
  clientPortalId: string;
  colorCode: string;
  createdAt: string;
  updatedAt?: string;
  translations?: { language: string; title?: string }[];
}

export interface UseTagsProps {
  clientPortalId?: string;
  type?: string;
  searchValue?: string;
  cursor?: string;
  limit?: number;
  fetchAll?: boolean;
  cursorMode?: string;
  direction?: 'forward' | 'backward';
  sortField?: string;
  sortMode?: string;
  sortDirection?: string;
}

interface UseTagsResult {
  tags: CmsTag[];
  totalCount: number;
  pageInfo?: IRecordTableCursorPageInfo;
  loading: boolean;
  error?: any;
  refetch: () => void;
  handleFetchMore: ({ direction }: { direction: EnumCursorDirection }) => void;
}

export const TAGS_PER_PAGE = 30;

export function useTags({
  clientPortalId,
  type,
  searchValue,
  cursor,
  limit = TAGS_PER_PAGE,
  fetchAll = false,
  cursorMode,
  direction,
  sortField,
  sortMode,
  sortDirection,
}: UseTagsProps): UseTagsResult {
  const language = useAtomValue(cmsLanguageAtom);
  const fetchedCursorsRef = useRef<Set<string>>(new Set());
  const fetchingMoreRef = useRef(false);
  const { cursor: tableCursor } = useRecordTableCursor({
    sessionKey: TAGS_CURSOR_SESSION_KEY,
  });

  const variables = useMemo(
    () => ({
      clientPortalId,
      type,
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
      type,
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
    errorPolicy: 'all',
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    fetchedCursorsRef.current.clear();
  }, [variables]);

  const pageInfo = data?.cmsTags?.pageInfo;

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
    if (!fetchAll) return;
    fetchRemainingTags();
  }, [fetchAll, fetchRemainingTags]);

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
          if (!fetchMoreResult?.cmsTags) return prev;

          const isForward = direction === EnumCursorDirection.FORWARD;
          const fetchPageInfo = fetchMoreResult.cmsTags?.pageInfo || {};
          const prevPageInfo = prev.cmsTags?.pageInfo || {};
          const fetchTags = fetchMoreResult.cmsTags?.tags || [];
          const prevTags = prev.cmsTags?.tags || [];

          return {
            ...prev,
            cmsTags: {
              ...fetchMoreResult.cmsTags,
              tags: isForward
                ? [...prevTags, ...fetchTags]
                : [...fetchTags, ...prevTags],
              pageInfo: {
                endCursor: isForward
                  ? fetchPageInfo.endCursor
                  : prevPageInfo.endCursor,
                hasNextPage: isForward
                  ? fetchPageInfo.hasNextPage
                  : prevPageInfo.hasNextPage,
                hasPreviousPage: isForward
                  ? prevPageInfo.hasPreviousPage
                  : fetchPageInfo.hasPreviousPage,
                startCursor: isForward
                  ? prevPageInfo.startCursor
                  : fetchPageInfo.startCursor,
              },
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

  const tags = data?.cmsTags?.tags || [];
  const totalCount = data?.cmsTags?.totalCount || 0;

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
