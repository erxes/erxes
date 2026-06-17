import {
  Badge,
  Button,
  Checkbox,
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

import {
  GET_ARCHIVED_DEALS,
  GET_DEALS,
} from '@/deals/graphql/queries/DealsQueries';
import { IDeal, IDealList } from '@/deals/types/deals';

/**
 * Left pane of the merge sheet: pick the deal to merge into the current one.
 * Board → Pipeline → Stage narrow the list, pre-filled to the target deal's own
 * location so its siblings show immediately. The target deal is shown disabled
 * (you can't merge a deal into itself); merged deals are always hidden. Archived
 * deals are loaded separately and only offered when the "Include archived"
 * checkbox is shown (i.e. the picked stage actually has archived deals).
 */
export const DealMergeSourcePicker = ({
  targetDealId,
  initialBoardId = '',
  initialPipelineId = '',
  initialStageId = '',
  selectedSourceId,
  onSelect,
}: {
  targetDealId: string;
  initialBoardId?: string;
  initialPipelineId?: string;
  initialStageId?: string;
  selectedSourceId?: string;
  onSelect: (dealId: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const [boardId, setBoardId] = useState(initialBoardId);
  const [pipelineId, setPipelineId] = useState(initialPipelineId);
  const [stageId, setStageId] = useState(initialStageId);
  const [includeArchived, setIncludeArchived] = useState(false);
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

  // Active deals only. We deliberately DON'T pass noSkipArchive here: with it on
  // the backend returns archived/merged deals too, and the limit (30) gets eaten
  // by rows we then strip on the client — so a stage could look half-empty. The
  // default backend filter already excludes archived/merged, so the limit is
  // spent entirely on real, mergeable deals. Archived deals are fetched below.
  const { data, loading } = useQuery<{ deals: IDealList }>(GET_DEALS, {
    variables: {
      search: browsing ? undefined : debouncedSearch || undefined,
      pipelineId: pipelineId || undefined,
      stageId: stageId || undefined,
      limit: 30,
      orderBy: { modifiedAt: -1 },
    },
    skip: !browsing && !debouncedSearch,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  // Archived deals for the picked stage. archivedDeals is pipeline-scoped, so we
  // narrow to the current stage on the client. Only queried once a stage is
  // chosen — archived merge sources only make sense when browsing a stage.
  const { data: archivedData } = useQuery<{ archivedDeals: IDealList }>(
    GET_ARCHIVED_DEALS,
    {
      variables: {
        pipelineId: pipelineId || '',
        limit: 50,
        orderBy: { modifiedAt: -1 },
      },
      skip: !stageId || !pipelineId,
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
  );

  // Active, mergeable deals (defend against any merged rows that slip through).
  const activeDeals = (data?.deals?.list || []).filter(
    (deal) => deal.status !== 'merged' && deal.status !== 'archived',
  );
  const archivedDeals: IDeal[] = (
    archivedData?.archivedDeals?.list || []
  ).filter((deal) => deal.stageId === stageId && deal._id !== targetDealId);
  const hasArchived = Boolean(stageId) && archivedDeals.length > 0;

  // Append archived deals only when the user opts in via the checkbox.
  const visibleDeals =
    includeArchived && hasArchived
      ? [...activeDeals, ...archivedDeals]
      : activeDeals;
  const selectableCount = visibleDeals.filter(
    (deal) => deal._id !== targetDealId,
  ).length;

  const handleBoardChange = (val: string | string[]) => {
    setBoardId(Array.isArray(val) ? val[0] : val);
    setPipelineId('');
    setStageId('');
    setIncludeArchived(false);
  };
  const handlePipelineChange = (val: string | string[]) => {
    setPipelineId(Array.isArray(val) ? val[0] : val);
    setStageId('');
    setIncludeArchived(false);
  };
  const handleStageChange = (val: string | string[]) => {
    setStageId(Array.isArray(val) ? val[0] : val);
    setIncludeArchived(false);
  };
  const clearAll = () => {
    setBoardId('');
    setPipelineId('');
    setStageId('');
    setSearch('');
    setIncludeArchived(false);
  };

  return (
    <div className="flex flex-col overflow-hidden border-r h-full">
      <div className="flex flex-col gap-4 p-4">
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
        {hasArchived && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-accent-foreground">
            <Checkbox
              checked={includeArchived}
              onCheckedChange={(val) => setIncludeArchived(Boolean(val))}
            />
            Include archived deals ({archivedDeals.length})
          </label>
        )}
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
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {deal.number}
                    {deal.status === 'archived' && (
                      <Badge variant="warning" className="h-4 px-1 text-[10px]">
                        Archived
                      </Badge>
                    )}
                  </span>
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
