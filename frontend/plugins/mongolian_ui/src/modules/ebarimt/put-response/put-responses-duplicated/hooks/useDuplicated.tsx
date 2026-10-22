import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  parseDateRangeFromString,
  useMultiQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { duplicatedQueries } from '~/modules/ebarimt/put-response/put-responses-duplicated/graphql/DuplicatedQueries';
import { compactList } from '@/shared/utils/cursorList';
import type { EbarimtPutResponsesDuplicatedQueryVariables } from '~/gql/graphql';
import { duplicatedTotalCountAtom } from '../states/DuplicatedCounts';

// The resolver's default page size, which the list has always loaded.
export const DUPLICATED_PER_PAGE = 20;

export const useDuplicatedVariables =
  (): EbarimtPutResponsesDuplicatedQueryVariables => {
    const [{ billType, dateRange }] = useMultiQueryState<{
      billType: string;
      dateRange: string;
    }>(['billType', 'dateRange']);

    const parsedDateRange = parseDateRangeFromString(dateRange);

    return {
      page: 1,
      perPage: DUPLICATED_PER_PAGE,
      startDate: parsedDateRange?.from,
      endDate: parsedDateRange?.to,
      billType: billType || undefined,
    };
  };

export const useDuplicated = () => {
  const setPutResponseDuplicatedTotalCount = useSetAtom(
    duplicatedTotalCountAtom,
  );
  const variables = useDuplicatedVariables();

  const { data, loading, fetchMore, error } = useQuery(
    duplicatedQueries.putResponsesDuplicated,
    { variables },
  );

  const responseData = data?.putResponsesDuplicated;
  const putResponsesDuplicated = compactList(responseData?.list);
  const totalCount = responseData?.totalCount ?? 0;
  // The resolver pages by page/perPage; loaded pages append, so only the
  // forward direction can fetch more.
  const pageInfo = {
    hasNextPage: responseData?.pageInfo.hasNextPage ?? false,
    hasPreviousPage: false,
  };

  useEffect(() => {
    setPutResponseDuplicatedTotalCount(totalCount);
  }, [totalCount, setPutResponseDuplicatedTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (direction !== EnumCursorDirection.FORWARD || !pageInfo.hasNextPage) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page:
          Math.ceil(putResponsesDuplicated.length / DUPLICATED_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (
          !prev.putResponsesDuplicated ||
          !fetchMoreResult.putResponsesDuplicated
        ) {
          return prev;
        }

        return {
          ...prev,
          putResponsesDuplicated: {
            ...fetchMoreResult.putResponsesDuplicated,
            list: [
              ...prev.putResponsesDuplicated.list,
              ...fetchMoreResult.putResponsesDuplicated.list,
            ],
          },
        };
      },
    });
  };

  return {
    loading,
    error,
    putResponsesDuplicated,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
