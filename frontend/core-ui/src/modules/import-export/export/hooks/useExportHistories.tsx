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

export function useExportHistories({ entityType }: { entityType: string }) {
  const { data, loading, error, fetchMore } =
    useQuery<ExportHistoriesQueryResponse>(GET_EXPORT_HISTORIES, {
      variables: {
        entityType,
        limit: EXPORT_HISTORIES_PER_PAGE,
      },
    });

  const { list = [], totalCount = 0, pageInfo } = data?.exportHistories || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        limit: EXPORT_HISTORIES_PER_PAGE,
        direction,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
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
  };

  const hasNextPage = pageInfo?.hasNextPage;
  const hasPreviousPage = pageInfo?.hasPreviousPage;

  return {
    list,
    totalCount,
    loading,
    error,
    pageInfo,
    hasNextPage,
    hasPreviousPage,
    handleFetchMore,
  };
}
