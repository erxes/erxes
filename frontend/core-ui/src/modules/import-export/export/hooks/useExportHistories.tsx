import * as React from 'react';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IPageInfo, TExportProgress } from 'ui-modules';
import { GET_EXPORT_HISTORIES } from '~/modules/import-export/export/graphql/exportQueries';

const EXPORT_HISTORIES_PER_PAGE = 20;

interface ExportHistoriesQueryResponse {
  exportHistories: {
    list: TExportProgress[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
}

type PerTypeState = {
  entityType: string;
  list: TExportProgress[];
  totalCount: number;
  pageInfo?: IPageInfo;
  loading: boolean;
  error?: any;
  fetchMore: (opts: any) => any;
};

const sortByCreatedAtDesc = (a: TExportProgress, b: TExportProgress) => {
  const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
  return db - da;
};

function uniqStable(arr: string[]) {
  const seen = new Set<string>();
  return (arr || []).filter((x) => {
    if (!x) return false;
    if (seen.has(x)) return false;
    seen.add(x);
    return true;
  });
}

function ExportHistoriesByType({
  entityType,
  onState,
}: {
  entityType: string;
  onState: (state: PerTypeState) => void;
}) {
  const q = useQuery<ExportHistoriesQueryResponse>(GET_EXPORT_HISTORIES, {
    variables: { entityType, limit: EXPORT_HISTORIES_PER_PAGE },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const raw = q.data?.exportHistories;
  const list = React.useMemo(() => raw?.list ?? [], [raw?.list]);
  const totalCount = raw?.totalCount ?? 0;
  const pageInfo = raw?.pageInfo;

  React.useEffect(() => {
    onState({
      entityType,
      list,
      totalCount,
      pageInfo,
      loading: q.loading,
      error: q.error,
      fetchMore: q.fetchMore,
    });
  }, [entityType, list, totalCount, pageInfo, q.loading, q.error, q.fetchMore, onState]);

  return null;
}

export function useExportHistories({ entityTypes }: { entityTypes: string[] }) {

  const typesKey = (entityTypes || []).join('|');

  const types = React.useMemo(() => {
    return uniqStable(entityTypes);
  }, [typesKey]);

  const [perType, setPerType] = React.useState<Record<string, PerTypeState>>({});

  const perTypeRef = React.useRef(perType);
  React.useEffect(() => {
    perTypeRef.current = perType;
  }, [perType]);

  const onState = React.useCallback((state: PerTypeState) => {
    setPerType((prev) => ({ ...prev, [state.entityType]: state }));
  }, []);

  React.useEffect(() => {
    setPerType((prev) => {
      const next: Record<string, PerTypeState> = {};
      for (const t of types) if (prev[t]) next[t] = prev[t];
      return next;
    });
  }, [typesKey]); 

  const results = React.useMemo(() => {
    return types.map((t) => perType[t]).filter(Boolean) as PerTypeState[];
  }, [types, perType]);

  const loading = React.useMemo(() => {
    return types.some((t) => perType[t]?.loading ?? true);
  }, [types, perType]);

  const error = React.useMemo(() => {
    return results.find((r) => r.error)?.error;
  }, [results]);

  const list = React.useMemo(() => {
    return results.flatMap((r) => r.list || []).sort(sortByCreatedAtDesc);
  }, [results]);

  const totalCount = React.useMemo(() => {
    return results.reduce((sum, r) => sum + (r.totalCount || 0), 0);
  }, [results]);

  const hasNextPage = React.useMemo(() => {
    return results.some((r) => r.pageInfo?.hasNextPage);
  }, [results]);

  const hasPreviousPage = React.useMemo(() => {
    return results.some((r) => r.pageInfo?.hasPreviousPage);
  }, [results]);

  const handleFetchMore = React.useCallback(
    async ({ direction }: { direction: EnumCursorDirection }) => {
      const snapshotTypes = types;
      const snapshot = perTypeRef.current;

      await Promise.all(
        snapshotTypes.map((t) => {
          const r = snapshot[t];
          if (!r?.pageInfo) return Promise.resolve();

          const pageInfo = r.pageInfo;
          if (!validateFetchMore({ direction, pageInfo })) return Promise.resolve();

          const cursor =
            direction === EnumCursorDirection.FORWARD
              ? pageInfo.endCursor
              : pageInfo.startCursor;

          return r.fetchMore({
            variables: {
              entityType: r.entityType,
              limit: EXPORT_HISTORIES_PER_PAGE,
              direction,
              cursor,
            },
            updateQuery: (prev: ExportHistoriesQueryResponse, { fetchMoreResult }: any) => {
              if (!fetchMoreResult) return prev;

              return Object.assign({}, prev, {
                exportHistories: mergeCursorData({
                  direction,
                  fetchMoreResult: fetchMoreResult.exportHistories,
                  prevResult: prev.exportHistories,
                }),
              });
            },
          });
        }),
      );
    },
    [typesKey], 
  );

  const Queries = React.useMemo(() => {
    return (
      <>
        {types.map((t) => (
          <ExportHistoriesByType key={t} entityType={t} onState={onState} />
        ))}
      </>
    );
  }, [typesKey, onState]);

  return {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
    Queries,
  };
}
