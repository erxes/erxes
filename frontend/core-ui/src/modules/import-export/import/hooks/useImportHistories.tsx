import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IPageInfo, TImportProgress } from 'ui-modules';
import { GET_IMPORT_HISTORIES } from '~/modules/import-export/import/graphql/importQueries';

const IMPORT_HISTORIES_PER_PAGE = 20;

interface ImportHistoriesQueryResponse {
  importHistories: {
    list: TImportProgress[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
}

export function useImportHistories({ entityTypes }: { entityTypes: string[] }) {
  const { data, loading, error, fetchMore } =
    useQuery<ImportHistoriesQueryResponse>(GET_IMPORT_HISTORIES, {
      variables: {
        entityTypes,
        limit: IMPORT_HISTORIES_PER_PAGE,
      },
    });

  const { list = [], totalCount = 0, pageInfo } = data?.importHistories || {};

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
        limit: IMPORT_HISTORIES_PER_PAGE,
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
          importHistories: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.importHistories,
            prevResult: prev.importHistories,
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
