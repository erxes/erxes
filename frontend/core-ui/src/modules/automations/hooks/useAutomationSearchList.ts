import { AUTOMATIONS_SWITCHER_LIST } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { useState } from 'react';
import { IPageInfo } from 'ui-modules';
import { useDebounce } from 'use-debounce';

export type TAutomationSearchItem = Pick<
  IAutomation,
  '_id' | 'name' | 'status'
>;

type QueryResponse = {
  automationsMain: {
    list: TAutomationSearchItem[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
};

const SEARCH_PAGE_SIZE = 20;

/** Searchable, paged automation names for pickers; idle until `enabled`. */
export const useAutomationSearchList = (enabled: boolean) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, loading, error, fetchMore } = useQuery<QueryResponse>(
    AUTOMATIONS_SWITCHER_LIST,
    {
      variables: { searchValue: debouncedSearch, limit: SEARCH_PAGE_SIZE },
      skip: !enabled,
    },
  );

  const { list = [], totalCount = 0, pageInfo } = data?.automationsMain || {};

  const handleFetchMore = () => {
    const direction = EnumCursorDirection.FORWARD;
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor: pageInfo?.endCursor,
        limit: SEARCH_PAGE_SIZE,
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
    search,
    setSearch,
    automations: list,
    loading,
    error,
    totalCount,
    handleFetchMore,
  };
};
