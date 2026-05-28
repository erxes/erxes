import { Input, Popover } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import { IDeal, IDealList } from '@/deals/types/deals';
import { IconLoader2, IconSearch } from '@tabler/icons-react';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useQuery } from '@apollo/client';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';

export const CommonDealSearch = () => {
  const navigate = useNavigate();
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [debouncedSearch] = useDebounce(search.trim(), 350);

  const { data, loading } = useQuery<{ deals: IDealList }>(GET_DEALS, {
    variables: {
      search: debouncedSearch,
      noSkipArchive: true,
      limit: 10,
      orderBy: { modifiedAt: -1 },
    },
    skip: debouncedSearch.length < 2,
    fetchPolicy: 'cache-and-network',
  });

  const deals = data?.deals?.list || [];
  const showDropdown = focused && debouncedSearch.length >= 2;

  const handleSelect = (deal: IDeal) => {
    const pipelineId = deal.pipeline?._id;
    const boardId = deal.boardId || deal.pipeline?.boardId;

    if (!pipelineId || !boardId) {
      return;
    }

    setActiveDealId(deal._id);
    setSearch('');
    setFocused(false);
    navigate(
      `/sales/deals?boardId=${boardId}&pipelineId=${pipelineId}&salesItemId=${deal._id}`,
    );
  };

  return (
    <Popover
      open={showDropdown}
      onOpenChange={(open) => {
        if (!open) {
          setFocused(false);
        }
      }}
    >
      <Popover.Anchor asChild>
        <div className="relative w-72">
          <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 pl-8"
            placeholder="Search deals"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setFocused(true)}
          />
        </div>
      </Popover.Anchor>
      <Popover.Content
        align="end"
        sideOffset={4}
        className="w-96 overflow-hidden p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {loading && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <IconLoader2 className="size-4 animate-spin" />
            Searching
          </div>
        )}

        {!loading && !deals.length && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No deals found
          </div>
        )}

        {!loading &&
          deals.map((deal) => (
            <button
              key={deal._id}
              type="button"
              className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(deal);
              }}
            >
              <span className="font-medium">
                {[deal.number, deal.name].filter(Boolean).join(' - ')}
              </span>
              <span className="text-xs text-muted-foreground">
                {deal.pipeline?.name}
              </span>
            </button>
          ))}
      </Popover.Content>
    </Popover>
  );
};
