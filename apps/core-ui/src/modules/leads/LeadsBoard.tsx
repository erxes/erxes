import type { Customer, LeadStage } from '@erxes/core-contract';
import { DndContext, type DragEndEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Avatar, Button, cn, readImage, ScrollArea, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { api, messageOf } from '~/lib/api';
import { formatTotal } from '~/lib/cursorList';
import { customerTitle } from '~/modules/contacts/components/ContactPicker';
import { CUSTOMERS_KEY, useCustomersFilters } from '~/modules/contacts/customers/useCustomers';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { DisqualifyDialog } from './LeadActions';
import { daysSince, useLeadStages, useMoveLeads } from './useLeads';

const PAGE = 30;

/** One stage's leads, newest first, a page at a time (with the list's search, tags, owner and advanced filter). */
const useStageLeads = (stageId: string) => {
  const { leadStageId: _tab, ...filters } = useCustomersFilters('lead');

  return useInfiniteQuery({
    queryKey: [...CUSTOMERS_KEY, 'list', 'board', stageId, filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      api.customers.list({ ...filters, leadStageId: stageId, limit: PAGE, cursor: pageParam, direction: 'forward', cursorMode: 'exclusive' }),
    getNextPageParam: (page) => (page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined),
  });
};

const LeadCard = ({ lead, overlay }: { lead: Customer; overlay?: boolean }) => {
  const { openRecord } = useSidePanel();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id, data: { lead } });
  const days = daysSince(lead.leadStageChangedAt);
  const name = customerTitle(lead) || 'Unnamed lead';

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={() => openRecord({ contentType: 'core:customer', contentId: lead.id })}
      className={cn(
        'flex cursor-grab flex-col gap-1.5 rounded-lg border bg-background p-3 text-left shadow-xs transition-shadow hover:shadow-sm active:cursor-grabbing',
        isDragging && !overlay && 'opacity-40',
        overlay && 'rotate-2 shadow-lg',
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <Avatar.Image src={readImage(lead.avatarUrl ?? undefined)} />
          <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
        {days !== null && (
          <span className={cn('shrink-0 text-xs tabular-nums text-muted-foreground', days >= 14 && 'text-warning')} title="Days in this stage">
            {days === 0 ? 'today' : `${days}d`}
          </span>
        )}
      </div>
      {lead.primaryEmail && (
        <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <IconMail className="size-3.5 shrink-0" />
          <span className="truncate">{lead.primaryEmail}</span>
        </span>
      )}
      {lead.primaryPhone && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconPhone className="size-3.5 shrink-0" />
          {lead.primaryPhone}
        </span>
      )}
      {lead.source && <span className="w-fit rounded bg-muted px-1.5 py-0.5 text-[11px] capitalize text-muted-foreground">{lead.source}</span>}
    </div>
  );
};

const StageColumn = ({ stage }: { stage: LeadStage }) => {
  const query = useStageLeads(stage.id);
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const leads = query.data?.pages.flatMap((page) => page.data) ?? [];
  const first = query.data?.pages[0];

  return (
    <div
      ref={setNodeRef}
      className={cn('flex h-full w-72 shrink-0 flex-col rounded-xl bg-muted/50 transition-colors', isOver && 'bg-primary/10 ring-2 ring-primary/40')}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="size-2.5 rounded-full" style={{ background: stage.color }} />
        <span className="flex-1 truncate text-sm font-semibold">{stage.name}</span>
        <span className="text-xs tabular-nums text-muted-foreground">{first ? formatTotal(first.totalCount, first.totalCapped) : ''}</span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 px-2 pb-2">
          {query.isPending && Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)}
          {query.error && <p className="p-2 text-xs text-destructive">{messageOf(query.error)}</p>}
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          {!query.isPending && !leads.length && <p className="py-6 text-center text-xs text-muted-foreground">Drop leads here</p>}
          {query.hasNextPage && (
            <Button variant="ghost" size="sm" onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage}>
              Show more
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * Leads as a board, one column per stage: drag a card to move the lead
 * (a disqualified column asks why). Search, tags, owner and the advanced
 * filter apply to every column.
 */
export const LeadsBoard = () => {
  const { stages, loading } = useLeadStages();
  const move = useMoveLeads();
  const [dragging, setDragging] = useState<Customer | null>(null);
  const [disqualify, setDisqualify] = useState<{ id: string; stageId: string } | null>(null);
  // A click opens the lead; only a real drag (6px) moves it.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);

    const lead = active.data.current?.lead as Customer | undefined;
    const stage = stages.find((item) => item.id === over?.id);

    if (!lead || !stage || stage.id === lead.leadStageId) return;
    if (stage.kind === 'disqualified') setDisqualify({ id: lead.id, stageId: stage.id });
    else move.mutate({ ids: [lead.id], stageId: stage.id });
  };

  if (loading) return <Skeleton className="m-3 h-96" />;

  return (
    <DndContext sensors={sensors} onDragStart={({ active }) => setDragging((active.data.current?.lead as Customer) ?? null)} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-3">
        {stages.map((stage) => (
          <StageColumn key={stage.id} stage={stage} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>{dragging && <LeadCard lead={dragging} overlay />}</DragOverlay>
      <DisqualifyDialog ids={disqualify ? [disqualify.id] : []} stageId={disqualify?.stageId ?? null} onClose={() => setDisqualify(null)} />
    </DndContext>
  );
};
