import type { Company, Customer, LeadRecordType, LeadStage } from '@erxes/core-contract';
import { DndContext, type DragEndEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { IconMail, IconPhone } from '@tabler/icons-react';
import { type InfiniteData, type QueryClient, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, cn, readImage, ScrollArea, Skeleton } from 'erxes-ui';
import { memo, useState } from 'react';
import { api, messageOf } from '~/lib/api';
import { formatTotal } from '~/lib/cursorList';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { CUSTOMERS_KEY, useCustomersFilters } from '~/modules/contacts/customers/useCustomers';
import { COMPANIES_KEY, useCompaniesFilters } from '~/modules/contacts/companies/useCompanies';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { DisqualifyDialog } from './LeadActions';
import { daysSince, LEAD_STAGES_KEY, useLeadStages, useMoveLeads } from './useLeads';

const PAGE = 30;

type BoardLead = Customer | Company;

/** One stage's leads, newest first, a page at a time (with the list's search, tags, owner and advanced filter). */
const useStageLeads = (recordType: LeadRecordType, stageId: string) => {
  const { leadStageId: _people, ...peopleFilters } = useCustomersFilters('lead');
  const { leadStageId: _companies, ...companyFilters } = useCompaniesFilters('lead');
  const filters = recordType === 'company' ? companyFilters : peopleFilters;

  return useInfiniteQuery<{ data: BoardLead[]; pageInfo: { hasNextPage: boolean; endCursor: string | null }; totalCount: number; totalCapped?: boolean }>({
    queryKey: [...(recordType === 'company' ? COMPANIES_KEY : CUSTOMERS_KEY), 'list', 'board', stageId, filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const page = { leadStageId: stageId, limit: PAGE, cursor: pageParam as string | undefined, direction: 'forward' as const, cursorMode: 'exclusive' as const };

      return recordType === 'company' ? api.companies.list({ ...companyFilters, ...page }) : api.customers.list({ ...peopleFilters, ...page });
    },
    getNextPageParam: (page) => (page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined),
  });
};

const LeadCard = memo(function LeadCard({ recordType, lead, overlay }: { recordType: LeadRecordType; lead: BoardLead; overlay?: boolean }) {
  const { openRecord } = useSidePanel();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id, data: { lead } });
  const days = daysSince(lead.leadStageChangedAt);
  const name = ('primaryName' in lead ? companyTitle(lead) : customerTitle(lead)) || 'Unnamed lead';

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      onClick={() => openRecord({ contentType: recordType === 'company' ? 'core:company' : 'core:customer', contentId: lead.id })}
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
});

const StageColumn = memo(function StageColumn({ recordType, stage }: { recordType: LeadRecordType; stage: LeadStage }) {
  const query = useStageLeads(recordType, stage.id);
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
            <LeadCard key={lead.id} recordType={recordType} lead={lead} />
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
});

type Page = { data: BoardLead[]; totalCount: number };

/**
 * Moves a card between columns right away (and the stage counts), before the
 * server answers: a drop must land where it was dropped. A refused move is
 * undone by the refetch that follows every move.
 */
const moveOnBoard = async (client: QueryClient, recordType: LeadRecordType, lead: BoardLead, toStageId: string) => {
  const board = [...(recordType === 'company' ? COMPANIES_KEY : CUSTOMERS_KEY), 'list', 'board'];
  const from = [...board, lead.leadStageId];
  const to = [...board, toStageId];
  const moved = { ...lead, leadStageId: toStageId, leadStageChangedAt: new Date().toISOString() } as BoardLead;

  await Promise.all([client.cancelQueries({ queryKey: from }), client.cancelQueries({ queryKey: to })]);
  client.setQueriesData<InfiniteData<Page>>({ queryKey: from }, (data) =>
    data && {
      ...data,
      pages: data.pages.map((page, index) => ({
        ...page,
        data: page.data.filter((item) => item.id !== lead.id),
        totalCount: index === 0 ? Math.max(0, page.totalCount - 1) : page.totalCount,
      })),
    },
  );
  client.setQueriesData<InfiniteData<Page>>({ queryKey: to }, (data) =>
    data && {
      ...data,
      pages: data.pages.map((page, index) => (index === 0 ? { ...page, data: [moved, ...page.data], totalCount: page.totalCount + 1 } : page)),
    },
  );
  client.setQueryData<{ data: LeadStage[] }>(LEAD_STAGES_KEY, (data) => {
    const field = recordType === 'company' ? 'companyLeadCount' : 'leadCount';

    return (
      data && {
        data: data.data.map((stage) =>
          stage.id === lead.leadStageId ? { ...stage, [field]: Math.max(0, stage[field] - 1) } : stage.id === toStageId ? { ...stage, [field]: stage[field] + 1 } : stage,
        ),
      }
    );
  });
};

/**
 * Leads as a board, one column per stage: drag a card to move the lead
 * (a disqualified column asks why). Search, tags, owner and the advanced
 * filter apply to every column.
 */
export const LeadsBoard = ({ recordType }: { recordType: LeadRecordType }) => {
  const { stages, loading } = useLeadStages();
  const move = useMoveLeads();
  const client = useQueryClient();
  const [dragging, setDragging] = useState<BoardLead | null>(null);
  const [disqualify, setDisqualify] = useState<{ id: string; stageId: string } | null>(null);
  // A click opens the lead; only a real drag (6px) moves it.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);

    const lead = active.data.current?.lead as BoardLead | undefined;
    const stage = stages.find((item) => item.id === over?.id);

    if (!lead || !stage || stage.id === lead.leadStageId) return;
    if (stage.kind === 'disqualified') setDisqualify({ id: lead.id, stageId: stage.id });
    else void moveOnBoard(client, recordType, lead, stage.id).then(() => move.mutate({ recordType, ids: [lead.id], stageId: stage.id }));
  };

  if (loading) return <Skeleton className="m-3 h-96" />;

  return (
    <DndContext sensors={sensors} onDragStart={({ active }) => setDragging((active.data.current?.lead as BoardLead) ?? null)} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-3">
        {stages.map((stage) => (
          <StageColumn key={stage.id} recordType={recordType} stage={stage} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>{dragging && <LeadCard recordType={recordType} lead={dragging} overlay />}</DragOverlay>
      <DisqualifyDialog recordType={recordType} ids={disqualify ? [disqualify.id] : []} stageId={disqualify?.stageId ?? null} onClose={() => setDisqualify(null)} />
    </DndContext>
  );
};
