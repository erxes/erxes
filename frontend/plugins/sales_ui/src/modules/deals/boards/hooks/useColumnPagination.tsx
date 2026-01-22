import { useCallback, useState } from 'react';

const DEFAULT_PAGE_SIZE = 20;

export interface ColumnPaginationInfo {
  hasMore: boolean;
  isLoading: boolean;
  totalCount?: number;
  cursor?: string | null;
  loadedCount: number;
}

export interface UseColumnPaginationReturn {
  pagination: Record<string, ColumnPaginationInfo>;
  initColumn: (columnId: string, totalCount?: number) => void;
  setLoading: (columnId: string, isLoading: boolean) => void;
  updateAfterFetch: (
    columnId: string,
    fetchedCount: number,
    hasMore: boolean,
    cursor?: string | null,
    totalCount?: number,
  ) => void;
  getHasMore: (columnId: string) => boolean;
  getIsLoading: (columnId: string) => boolean;
  getCursor: (columnId: string) => string | null | undefined;
  reset: (columnId?: string) => void;
}

export function useColumnPagination(
  pageSize = DEFAULT_PAGE_SIZE,
): UseColumnPaginationReturn {
  const [pagination, setPagination] = useState<
    Record<string, ColumnPaginationInfo>
  >({});

  const initColumn = useCallback(
    (columnId: string, totalCount?: number) => {
      setPagination((prev) => ({
        ...prev,
        [columnId]: {
          hasMore: totalCount === undefined || totalCount > pageSize,
          isLoading: false,
          totalCount,
          cursor: null,
          loadedCount: 0,
        },
      }));
    },
    [pageSize],
  );

  const setLoading = useCallback((columnId: string, isLoading: boolean) => {
    setPagination((prev) => ({
      ...prev,
      [columnId]: {
        ...(prev[columnId] || { hasMore: true, loadedCount: 0 }),
        isLoading,
      },
    }));
  }, []);

  const updateAfterFetch = useCallback(
    (
      columnId: string,
      fetchedCount: number,
      hasMore: boolean,
      cursor?: string | null,
      totalCount?: number,
    ) => {
      setPagination((prev) => {
        const current = prev[columnId] || {
          hasMore: true,
          isLoading: false,
          loadedCount: 0,
        };
        return {
          ...prev,
          [columnId]: {
            hasMore,
            isLoading: false,
            cursor,
            loadedCount: current.loadedCount + fetchedCount,
            totalCount: totalCount ?? current.totalCount,
          },
        };
      });
    },
    [],
  );

  const getHasMore = useCallback(
    (columnId: string) => {
      return pagination[columnId]?.hasMore ?? true;
    },
    [pagination],
  );

  const getIsLoading = useCallback(
    (columnId: string) => {
      return pagination[columnId]?.isLoading ?? false;
    },
    [pagination],
  );

  const getCursor = useCallback(
    (columnId: string) => {
      return pagination[columnId]?.cursor;
    },
    [pagination],
  );

  const reset = useCallback((columnId?: string) => {
    if (columnId) {
      setPagination((prev) => {
        const newState = { ...prev };
        delete newState[columnId];
        return newState;
      });
    } else {
      setPagination({});
    }
  }, []);

  return {
    pagination,
    initColumn,
    setLoading,
    updateAfterFetch,
    getHasMore,
    getIsLoading,
    getCursor,
    reset,
  };
}
