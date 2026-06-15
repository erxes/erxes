import {
  Badge,
  Button,
  Input,
  ScrollArea,
  Separator,
  Spinner,
  cn,
} from 'erxes-ui';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import { IDealList } from '@/deals/types/deals';

/**
 * Left pane of the merge sheet: pick the deal to merge into the current one.
 * Board → Pipeline → Stage narrow the list. The target deal is shown disabled
 * (you can't merge a deal into itself); merged/archived deals are hidden.
 */
export const DealMergeSourcePicker = ({
  targetDealId,
  selectedSourceId,
  onSelect,
}: {
  targetDealId: string;
  selectedSourceId?: string;
  onSelect: (dealId: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);

  // Search and the Board/Pipeline/Stage drill-down are two independent ways to
  // find a deal — never AND-ed. Once you drill into a pipeline/stage we list ALL
  // of its deals and ignore the search box (a leftover search term must never
  // hide a stage's deals). Search is only used when nothing is drilled down.
  const browsing = Boolean(stageId || pipelineId);

  // Drop any stale search text the moment the user starts browsing, so the
  // input never shows a term that isn't being applied.
  useEffect(() => {
    if (browsing && search) setSearch('');
  }, [browsing, search]);

  // Mirrors the proven CommonDealSearch query: GET_DEALS via useQuery with
  // noSkipArchive so the backend returns the deals regardless of their status;
  // we filter merged/archived out on the client below.
  const { data, loading } = useQuery<{ deals: IDealList }>(GET_DEALS, {
    variables: {
      search: browsing ? undefined : debouncedSearch || undefined,
      pipelineId: pipelineId || undefined,
      stageId: stageId || undefined,
      noSkipArchive: true,
      limit: 30,
      orderBy: { modifiedAt: -1 },
    },
    skip: !browsing && !debouncedSearch,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Hide merged/archived deals, but keep the target deal in the list (shown
  // disabled) so a stage with 2 deals doesn't look empty.
  const visibleDeals = (data?.deals?.list || []).filter(
    (deal) => deal.status !== 'merged' && deal.status !== 'archived',
  );
  const selectableCount = visibleDeals.filter(
    (deal) => deal._id !== targetDealId,
  ).length;

  const handleBoardChange = (val: string | string[]) => {
    setBoardId(Array.isArray(val) ? val[0] : val);
    setPipelineId('');
    setStageId('');
  };
  const handlePipelineChange = (val: string | string[]) => {
    setPipelineId(Array.isArray(val) ? val[0] : val);
    setStageId('');
  };
  const handleStageChange = (val: string | string[]) => {
    setStageId(Array.isArray(val) ? val[0] : val);
  };
  const clearAll = () => {
    setBoardId('');
    setPipelineId('');
    setStageId('');
    setSearch('');
  };

  return (
    <div className="flex flex-col overflow-hidden border-r h-full">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="merge-deal-search"
            className="text-xs font-medium text-accent-foreground"
          >
            Search
          </label>
          <Input
            id="merge-deal-search"
            placeholder={
              browsing
                ? 'Clear the board/pipeline/stage to search'
                : 'Search by name or number...'
            }
            value={search}
            disabled={browsing}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            or browse by location
          </span>
          {(boardId || pipelineId || stageId || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearAll}
            >
              <IconX className="size-3" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-accent-foreground">Board</p>
          <SelectBoard value={boardId} onValueChange={handleBoardChange} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-accent-foreground">Pipeline</p>
          <SelectPipeline
            value={pipelineId}
            boardId={boardId}
            onValueChange={handlePipelineChange}
            disabled={!boardId}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-accent-foreground">Stage</p>
          <SelectStage
            value={stageId}
            pipelineId={pipelineId}
            onValueChange={handleStageChange}
            disabled={!pipelineId}
          />
        </div>
        <div className="text-xs text-accent-foreground">
          {browsing || debouncedSearch
            ? `${selectableCount} deal(s) to merge`
            : 'Pick a board/pipeline/stage or search to list deals'}
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-3">
          {loading && visibleDeals.length === 0 && (
            <div className="flex gap-2 items-center px-2 h-8">
              <Spinner containerClassName="flex-none" />
              <span className="animate-pulse text-accent-foreground text-sm">
                Loading deals...
              </span>
            </div>
          )}
          {!loading && visibleDeals.length === 0 && (
            <span className="px-2 text-sm text-muted-foreground">
              No deals found here.
            </span>
          )}
          {visibleDeals.map((deal) => {
            const isTarget = deal._id === targetDealId;
            const isSelected = selectedSourceId === deal._id;
            return (
              <Button
                key={deal._id}
                variant="ghost"
                disabled={isTarget}
                className={cn(
                  'min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left',
                  isSelected && 'bg-primary/10 hover:bg-primary/10',
                )}
                onClick={() => !isTarget && onSelect(deal._id)}
              >
                <div className="flex flex-col items-start">
                  <span>{deal.name}</span>
                  {deal.number && (
                    <span className="text-xs text-muted-foreground">
                      {deal.number}
                    </span>
                  )}
                </div>
                {isTarget ? (
                  <Badge variant="secondary" className="ml-auto shrink-0">
                    This deal
                  </Badge>
                ) : isSelected ? (
                  <IconCheck className="ml-auto shrink-0" size={16} />
                ) : (
                  <IconPlus className="ml-auto shrink-0" size={16} />
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
