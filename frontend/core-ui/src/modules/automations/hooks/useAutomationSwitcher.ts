import { AUTOMATIONS_SWITCHER_LIST } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IPageInfo } from 'ui-modules';
import { useDebounce } from 'use-debounce';

type TAutomationSwitcherItem = Pick<IAutomation, '_id' | 'name' | 'status'>;

type QueryResponse = {
  automationsMain: {
    list: TAutomationSwitcherItem[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
};

const SWITCHER_PAGE_SIZE = 20;

export const useAutomationSwitcher = (currentId?: string) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, loading, error, fetchMore } = useQuery<QueryResponse>(
    AUTOMATIONS_SWITCHER_LIST,
    {
      variables: { searchValue: debouncedSearch, limit: SWITCHER_PAGE_SIZE },
      skip: !open,
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
        limit: SWITCHER_PAGE_SIZE,
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

  const handleSelect = (automationId: string) => {
    setOpen(false);
    if (automationId !== currentId) {
      navigate(`/automations/edit/${automationId}`);
    }
  };

  return {
    open,
    setOpen,
    search,
    setSearch,
    automations: list,
    loading,
    error,
    totalCount,
    handleFetchMore,
    handleSelect,
  };
};
