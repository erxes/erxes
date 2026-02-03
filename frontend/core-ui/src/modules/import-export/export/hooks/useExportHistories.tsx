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

export function useExportHistories({ entityTypes }: { entityTypes: string[] }) {
  // run one query per entityType (stable order)
  const results = entityTypes.map((entityType) => {
    const q = useQuery<ExportHistoriesQueryResponse>(GET_EXPORT_HISTORIES, {
      variables: {
        entityType,
        limit: EXPORT_HISTORIES_PER_PAGE,
      },
      // prevent cache collisions when using same query with different variables
      // (apollo usually handles this, but this keeps it safe)
      fetchPolicy: 'cache-and-network',
    });

    const { list = [], totalCount = 0, pageInfo } = q.data?.exportHistories || {};
    return {
      entityType,
      list,
      totalCount,
      pageInfo,
      loading: q.loading,
      error: q.error,
      fetchMore: q.fetchMore,
    } satisfies PerTypeState;
  });

  const loading = results.some((r) => r.loading);
  const error = results.find((r) => r.error)?.error;

  // merged list
  const list = results
    .flatMap((r) => r.list)
    .sort(sortByCreatedAtDesc);

  const totalCount = results.reduce((sum, r) => sum + (r.totalCount || 0), 0);

  const hasNextPage = results.some((r) => r.pageInfo?.hasNextPage);
  const hasPreviousPage = results.some((r) => r.pageInfo?.hasPreviousPage);

  const handleFetchMore = async ({ direction }: { direction: EnumCursorDirection }) => {
    // fetch more for each entityType that can paginate in that direction
    await Promise.all(
      results.map((r) => {
        const pageInfo = r.pageInfo;

        if (!pageInfo) {
          return Promise.resolve();
        }

        if (!validateFetchMore({ direction, pageInfo })) {
          return Promise.resolve();
        }

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
            if (!fetchMoreResult) {
              return prev;
            }

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
  };

  return {
    list,
    totalCount,
    loading,
    error,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  };
}
