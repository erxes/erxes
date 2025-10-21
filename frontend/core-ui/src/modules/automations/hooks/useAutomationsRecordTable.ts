import { AUTOMATIONS_MAIN_LIST } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { IPageInfo } from 'ui-modules';

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
  const { data, loading, fetchMore } = useQuery<QueryResponse>(
    AUTOMATIONS_MAIN_LIST,
    {
      ...(options || {}),
    },
  );

  const { list = [], totalCount = 0, pageInfo } = data?.automationsMain || {};
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleFetchMore = () => {
    if (!list || !totalCount || totalCount <= list.length) {
      return;
    }
    fetchMore({
      variables: {
        page: Math.ceil(list.length / 20) + 1,
        perPage: 20,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          automationsMain: {
            ...prev.automationsMain,
            list: [
              ...(prev.automationsMain?.list || []),
              ...(fetchMoreResult.automationsMain?.list || []),
            ],
          },
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
