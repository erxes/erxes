import { useQuery } from '@apollo/client';
import {
  Button,
  Combobox,
  Command,
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  Label,
  Popover,
  Spinner,
  mergeCursorData,
} from 'erxes-ui';
import { useId, useRef, useState } from 'react';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { GET_DOCUMENT_PRINT_SALES_DEALS } from '../graphql/queries';

type PrintDeal = {
  _id: string;
  name?: string | null;
  number?: string | null;
};

type PrintDealsResponse = {
  deals: {
    list?: PrintDeal[];
    pageInfo?: IRecordTableCursorPageInfo;
    totalCount?: number;
  };
};

function getDealLabel(deal: PrintDeal): string {
  return deal.name || deal.number || 'Unnamed deal';
}

function DocumentSalesDealOptions({
  pipelineId,
  stageId,
  search,
  onSelect,
}: Readonly<{
  pipelineId: string;
  stageId: string;
  search: string;
  onSelect: (deal: PrintDeal) => void;
}>) {
  const fetchingMore = useRef(false);
  const [paginationError, setPaginationError] = useState(false);
  const { data, loading, error, fetchMore, refetch } =
    useQuery<PrintDealsResponse>(GET_DOCUMENT_PRINT_SALES_DEALS, {
      variables: { pipelineId, stageId, search, limit: 20 },
      notifyOnNetworkStatusChange: true,
    });
  const { list = [], pageInfo } = data?.deals || {};
  const hasError = Boolean(error || paginationError);

  async function loadMore(): Promise<void> {
    if (loading || fetchingMore.current || !pageInfo?.hasNextPage) {
      return;
    }

    fetchingMore.current = true;
    setPaginationError(false);

    try {
      await fetchMore({
        variables: {
          cursor: pageInfo.endCursor,
          direction: EnumCursorDirection.FORWARD,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          return {
            ...previousResult,
            deals: mergeCursorData({
              direction: EnumCursorDirection.FORWARD,
              fetchMoreResult: fetchMoreResult.deals,
              prevResult: previousResult.deals,
            }),
          };
        },
      });
    } catch {
      setPaginationError(true);
    } finally {
      fetchingMore.current = false;
    }
  }

  async function retry(): Promise<void> {
    if (paginationError) {
      await loadMore();
      return;
    }

    try {
      await refetch();
    } catch {
      return;
    }
  }

  return (
    <>
      {loading && <Spinner />}
      {hasError && (
        <div role="alert" className="p-2 text-sm text-destructive">
          Could not load deals.{' '}
          <Button
            type="button"
            variant="link"
            onClick={retry}
            disabled={loading}
          >
            Retry
          </Button>
        </div>
      )}
      {!loading && !hasError && <Command.Empty>No deals found.</Command.Empty>}
      {list.map((deal) => (
        <Command.Item
          key={deal._id}
          value={deal._id}
          onSelect={() => onSelect(deal)}
        >
          {getDealLabel(deal)}
          {deal.name && deal.number && (
            <span className="ml-auto text-muted-foreground">{deal.number}</span>
          )}
        </Command.Item>
      ))}
      {pageInfo?.hasNextPage && !hasError && (
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={loadMore}
        >
          Load more
        </Button>
      )}
    </>
  );
}

function DocumentSalesDealSelect({
  id,
  value,
  pipelineId,
  stageId,
  onValueChange,
}: Readonly<{
  id: string;
  value: string;
  pipelineId: string;
  stageId: string;
  onValueChange: (value: string) => void;
}>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [label, setLabel] = useState('');
  const [query] = useDebounce(search.trim(), 300);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger id={id} disabled={!stageId}>
        <Combobox.Value
          value={value ? label || value : undefined}
          placeholder="Select a deal"
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search deals..."
          />
          <Command.List>
            {query !== search.trim() ? (
              <Spinner />
            ) : (
              <DocumentSalesDealOptions
                key={query}
                pipelineId={pipelineId}
                stageId={stageId}
                search={query}
                onSelect={(deal) => {
                  setLabel(getDealLabel(deal));
                  onValueChange(deal._id);
                  setOpen(false);
                }}
              />
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
}

function getSelectionId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] || '' : value;
}

export function DocumentSalesSelect({
  value,
  onValueChange,
}: Readonly<{
  value: string;
  onValueChange: (value: string) => void;
}>) {
  const id = useId();
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');

  return (
    <div className="grid gap-2">
      <Label htmlFor={`${id}-board`}>Board</Label>
      <SelectBoard
        id={`${id}-board`}
        mode="single"
        value={boardId}
        placeholder="Select a board"
        onValueChange={(nextValue) => {
          const nextId = getSelectionId(nextValue);
          if (nextId !== boardId) {
            setBoardId(nextId);
            setPipelineId('');
            setStageId('');
            onValueChange('');
          }
        }}
      />
      <Label htmlFor={`${id}-pipeline`}>Pipeline</Label>
      <SelectPipeline
        key={`pipeline:${boardId}`}
        id={`${id}-pipeline`}
        mode="single"
        value={pipelineId}
        boardId={boardId}
        placeholder="Select a pipeline"
        onValueChange={(nextValue) => {
          const nextId = getSelectionId(nextValue);
          if (nextId !== pipelineId) {
            setPipelineId(nextId);
            setStageId('');
            onValueChange('');
          }
        }}
      />
      <Label htmlFor={`${id}-stage`}>Stage</Label>
      <SelectStage
        key={`stage:${pipelineId}`}
        id={`${id}-stage`}
        mode="single"
        value={stageId}
        pipelineId={pipelineId}
        autoSelectFirst={false}
        placeholder="Select a stage"
        onValueChange={(nextValue) => {
          const nextId = getSelectionId(nextValue);
          if (nextId !== stageId) {
            setStageId(nextId);
            onValueChange('');
          }
        }}
      />
      <Label htmlFor={`${id}-deal`}>Deal</Label>
      <DocumentSalesDealSelect
        key={`deal:${pipelineId}:${stageId}`}
        id={`${id}-deal`}
        value={value}
        pipelineId={pipelineId}
        stageId={stageId}
        onValueChange={onValueChange}
      />
    </div>
  );
}
