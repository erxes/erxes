import { AUTOMATIONS_MAIN_LIST } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { IPageInfo } from 'ui-modules';
import { useAutomationRecordTableFilters } from './useAutomationRecordTableFilters';
import {
  EnumCursorDirection,
  validateFetchMore,
  mergeCursorData,
} from 'erxes-ui';

type QueryResponse = {
  automationsMain: {
    list: IAutomation[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
};

export const useAutomationsRecordTable = (
  options?: QueryHookOptions<QueryResponse>,
) => {
  const filters = useAutomationRecordTableFilters();
  const { data, loading, fetchMore } = useQuery<QueryResponse>(
    AUTOMATIONS_MAIN_LIST,
    {
      ...(options || {}),
      variables: {
        ...filters,
      },
    },
  );

  const { list = [], totalCount = 0, pageInfo } = data?.automationsMain || {};
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 10,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          automationsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.automationsMain,
            prevResult: prev.automationsMain,
          }),
        });
      },
    });
  };

  return {
    list,
    loading,
    totalCount,
    pageInfo,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  };
};
