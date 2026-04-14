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

export function useExportHistories({
  entityTypes,
}: {
  entityTypes?: string[];
}) {
  const { data, loading, error, fetchMore } =
    useQuery<ExportHistoriesQueryResponse>(GET_EXPORT_HISTORIES, {
      variables: {
        entityTypes,
        limit: EXPORT_HISTORIES_PER_PAGE,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
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
        entityTypes,
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

  return {
    list,
    totalCount,
    loading,
    error,
    pageInfo,
    hasNextPage: pageInfo?.hasNextPage,
    hasPreviousPage: pageInfo?.hasPreviousPage,
    handleFetchMore,
  };
}
