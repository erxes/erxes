import type { Company, Customer, LeadRecordType, LeadStage } from '@erxes/core-contract';
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DropAnimation,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { IconClockHour4, IconMail, IconPhone, IconPlus } from '@tabler/icons-react';
import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Avatar, Button, cn, readImage, Skeleton, Tooltip, useToast } from 'erxes-ui';
import { memo, useEffect, useRef, useState } from 'react';
import { api, messageOf } from '~/lib/api';
import { formatTotal } from '~/lib/cursorList';
import { companyTitle, customerTitle } from '~/modules/contacts/components/ContactPicker';
import { useMembers } from '~/components/inlineCells';
import { COMPANIES_KEY, useCompaniesFilters } from '~/modules/contacts/companies/useCompanies';
import { CUSTOMERS_KEY, useCustomersFilters } from '~/modules/contacts/customers/useCustomers';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { DisqualifyDialog } from './LeadActions';
import { daysSince, LEAD_STAGES_KEY, LEADS_REPORT_KEY, useLeadStages } from './useLeads';
import { useLeadsT, useStageName } from './i18n';

/**
 * Leads as a board, one column per stage: drag a card to move the lead (a
 * disqualified column asks why first). The card lands at once, in the place
 * the server will list it (columns are newest first), so nothing jumps when
 * the columns reload; only the two columns a move touches reload.
 */

const PAGE = 30;

type BoardLead = Customer | Company;

type Page = {
  data: BoardLead[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  totalCount: number;
  totalCapped?: boolean;
};

const boardKey = (recordType: LeadRecordType) => [
  ...(recordType === 'company' ? COMPANIES_KEY : CUSTOMERS_KEY),
  'list',
  'board',
];

/** One stage's leads, newest first, a page at a time (with the list's search, tags, owner and advanced filter). */
const useStageLeads = (recordType: LeadRecordType, stageId: string) => {
  const { leadStageId: _people, ...peopleFilters } = useCustomersFilters('lead');
  const { leadStageId: _companies, ...companyFilters } = useCompaniesFilters('lead');
  const filters = recordType === 'company' ? companyFilters : peopleFilters;

  return useInfiniteQuery<Page>({
    queryKey: [...boardKey(recordType), stageId, filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const page = {
        leadStageId: stageId,
        limit: PAGE,
        cursor: pageParam as string | undefined,
        direction: 'forward' as const,
        cursorMode: 'exclusive' as const,
      };

      return recordType === 'company'
        ? api.companies.list({ ...companyFilters, ...page })
        : api.customers.list({ ...peopleFilters, ...page });
    },
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined,
  });
};

const nameOf = (lead: BoardLead) =>
  ('primaryName' in lead ? companyTitle(lead) : customerTitle(lead)) || '';

/** Newest first, as the server lists them. */
const newerFirst = (a: BoardLead, b: BoardLead) =>
  a.createdAt === b.createdAt ? (a.id < b.id ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1;

// ─── Card ────────────────────────────────────────────────────────────────────

/** The owner as an avatar; their name on hover. */
const OwnerAvatar = ({ ownerId }: { ownerId: string }) => {
  const t = useLeadsT();
  const member = useMembers().find((item) => item.id === ownerId);
  const name = member?.fullName || member?.email || t('actions.owner');

  return (
    <Tooltip delayDuration={300}>
      <Tooltip.Trigger asChild>
        <span className="shrink-0">
          <Avatar size="lg">
            <Avatar.Image src={readImage(member?.avatarUrl ?? undefined)} />
            <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
          </Avatar>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>{t('board.owner', { name })}</Tooltip.Content>
    </Tooltip>
  );
};

const CardBody = ({ lead }: { lead: BoardLead }) => {
  const t = useLeadsT();
  const days = daysSince(lead.leadStageChangedAt);
  const name = nameOf(lead) || t('board.unnamed');

  const contact = lead.primaryEmail
    ? { icon: IconMail, text: lead.primaryEmail }
    : lead.primaryPhone
      ? { icon: IconPhone, text: lead.primaryPhone }
      : null;

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar size="lg" className="shrink-0">
          <Avatar.Image src={readImage(lead.avatarUrl ?? undefined)} />
          <Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
        {lead.ownerId && <OwnerAvatar ownerId={lead.ownerId} />}
      </div>
      {contact && (
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <contact.icon className="size-3.5 shrink-0" />
          <span className="truncate">{contact.text}</span>
        </span>
      )}
      {(lead.source || lead.leadStageChangedAt) && (
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {lead.source && (
            <span className="truncate rounded bg-muted px-1.5 py-0.5 capitalize">
              {lead.source}
            </span>
          )}
          {days !== null && (
            <span
              className={cn(
                'ml-auto flex shrink-0 items-center gap-1 tabular-nums',
                days >= 14 && 'text-warning',
              )}
              title={t('board.days-in-stage')}
            >
              <IconClockHour4 className="size-3.5" />
              {days === 0 ? t('today') : `${days}d`}
            </span>
          )}
        </div>
      )}
    </>
  );
};

const CARD =
  'flex select-none flex-col gap-2 rounded-lg border bg-background p-3 text-left shadow-xs';

const LeadCard = memo(function LeadCard({
  recordType,
  lead,
}: {
  recordType: LeadRecordType;
  lead: BoardLead;
}) {
  const { openRecord } = useSidePanel();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() =>
        openRecord({
          contentType: recordType === 'company' ? 'core:company' : 'core:customer',
          contentId: lead.id,
        })
      }
      className={cn(
        CARD,
        'cursor-grab outline-none transition-[box-shadow,border-color,opacity] hover:border-foreground/15 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing',
        // A placeholder stays where the card was while its copy is dragged.
        isDragging && 'border-dashed opacity-40 shadow-none',
      )}
    >
      <CardBody lead={lead} />
    </div>
  );
});

// ─── Column ──────────────────────────────────────────────────────────────────

const StageColumn = memo(function StageColumn({
  recordType,
  stage,
  onAdd,
}: {
  recordType: LeadRecordType;
  stage: LeadStage;
  onAdd: (stageId: string) => void;
}) {
  const t = useLeadsT();
  const stageName = useStageName();
  const query = useStageLeads(recordType, stage.id);
  const { setNodeRef, isOver, active } = useDroppable({ id: stage.id });
  const leads = query.data?.pages.flatMap((page) => page.data) ?? [];
  const first = query.data?.pages[0];
  const fromHere = (active?.data.current?.lead as BoardLead | undefined)?.leadStageId === stage.id;
  const target = isOver && !fromHere;
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  // The next page loads when the column's end scrolls into view.
  useEffect(() => {
    const node = sentinel.current;

    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-xl border-t-[3px] bg-muted/40 transition-[background-color,box-shadow] duration-150',
        target && 'bg-primary/5 shadow-[inset_0_0_0_2px] shadow-primary/30',
      )}
      style={{ borderTopColor: stage.color }}
    >
      <header className="flex h-11 shrink-0 items-center gap-2 pl-3 pr-1.5">
        <span className="truncate text-sm font-semibold">{stageName(stage.name)}</span>
        <span className="rounded-full bg-background px-1.5 text-xs tabular-nums text-muted-foreground">
          {first ? formatTotal(first.totalCount, first.totalCapped) : '·'}
        </span>
        <Tooltip delayDuration={300}>
          <Tooltip.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-7 text-muted-foreground"
              aria-label={t('board.add-here')}
              onClick={() => onAdd(stage.id)}
            >
              <IconPlus className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{t('board.add-here')}</Tooltip.Content>
        </Tooltip>
      </header>
      <div className="styled-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {query.isPending &&
          Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[92px] shrink-0 rounded-lg" />
          ))}
        {query.error && <p className="p-2 text-xs text-destructive">{messageOf(query.error)}</p>}
        {leads.map((lead) => (
          <LeadCard key={lead.id} recordType={recordType} lead={lead} />
        ))}
        {!query.isPending && !leads.length && (
          <div
            className={cn(
              'flex h-24 shrink-0 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground transition-colors',
              target && 'border-primary/40 text-primary',
            )}
          >
            {target ? t('board.drop-here') : t('board.empty')}
          </div>
        )}
        <div ref={sentinel} className="h-px shrink-0" />
        {isFetchingNextPage && <Skeleton className="h-[92px] shrink-0 rounded-lg" />}
      </div>
    </section>
  );
});

// ─── Moving ──────────────────────────────────────────────────────────────────

/**
 * Moves a card between columns in the cache, where the server will list it,
 * with the stage counts. Fetches of those columns in flight are dropped (not
 * reverted), so they can't bring the old order back.
 */
const moveInCache = (
  client: QueryClient,
  recordType: LeadRecordType,
  lead: BoardLead,
  toStageId: string,
) => {
  const board = boardKey(recordType);
  const from = [...board, lead.leadStageId];
  const to = [...board, toStageId];

  const moved = {
    ...lead,
    leadStageId: toStageId,
    leadStageChangedAt: new Date().toISOString(),
  } as BoardLead;

  void client.cancelQueries({ queryKey: from }, { revert: false });
  void client.cancelQueries({ queryKey: to }, { revert: false });
  client.setQueriesData<InfiniteData<Page>>(
    { queryKey: from },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page, index) => ({
          ...page,
          data: page.data.filter((item) => item.id !== lead.id),
          totalCount: index === 0 ? Math.max(0, page.totalCount - 1) : page.totalCount,
        })),
      },
  );
  client.setQueriesData<InfiniteData<Page>>({ queryKey: to }, (data) => {
    if (!data) return data;

    const pages = data.pages.map((page, index) => ({
      ...page,
      totalCount: index === 0 ? page.totalCount + 1 : page.totalCount,
    }));

    const last = pages.at(-1)!;
    const oldest = last.data.at(-1);

    // Older than everything loaded while more pages wait: it comes with them.
    if (last.pageInfo.hasNextPage && oldest && newerFirst(moved, oldest) > 0)
      return { ...data, pages };

    // Into the page it belongs to, in order.
    const at = pages.findIndex((page) => page.data.some((item) => newerFirst(moved, item) < 0));
    const index = at === -1 ? pages.length - 1 : at;

    pages[index] = {
      ...pages[index],
      data: [...pages[index].data, moved].sort(newerFirst),
    };

    return { ...data, pages };
  });
  client.setQueryData<{ data: LeadStage[] }>(LEAD_STAGES_KEY, (data) => {
    const field = recordType === 'company' ? 'companyLeadCount' : 'leadCount';

    return (
      data && {
        data: data.data.map((stage) =>
          stage.id === lead.leadStageId
            ? { ...stage, [field]: Math.max(0, stage[field] - 1) }
            : stage.id === toStageId
              ? { ...stage, [field]: stage[field] + 1 }
              : stage,
        ),
      }
    );
  });

  return { from, to };
};

/** The dragged copy glides into the card's new place. */
const DROP_ANIMATION: DropAnimation = {
  duration: 200,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } },
  }),
};

export const LeadsBoard = ({ recordType }: { recordType: LeadRecordType }) => {
  const { stages, loading } = useLeadStages();
  const client = useQueryClient();
  const { toast } = useToast();
  const { openNewRecord } = useSidePanel();
  const t = useLeadsT();
  const [dragging, setDragging] = useState<BoardLead | null>(null);

  const [disqualify, setDisqualify] = useState<{
    id: string;
    stageId: string;
  } | null>(null);

  const sensors = useSensors(
    // A click opens the lead; only a real drag moves it.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor),
  );

  const move = (lead: BoardLead, stageId: string) => {
    const { from, to } = moveInCache(client, recordType, lead, stageId);
    const list = recordType === 'company' ? COMPANIES_KEY : CUSTOMERS_KEY;

    api.leads
      .move({ recordType, ids: [lead.id], stageId })
      .catch((error: unknown) =>
        toast({
          variant: 'destructive',
          title: t('actions.move-failed'),
          description: messageOf(error),
        }),
      )
      .finally(() => {
        // Only what the move touched: its two columns, the counts, the table and the report.
        void client.invalidateQueries({ queryKey: from });
        void client.invalidateQueries({ queryKey: to });
        void client.invalidateQueries({ queryKey: LEAD_STAGES_KEY });
        void client.invalidateQueries({ queryKey: LEADS_REPORT_KEY });
        void client.invalidateQueries({
          queryKey: [...list, 'list'],
          predicate: (query) => query.queryKey[2] !== 'board',
        });
        void client.invalidateQueries({
          queryKey: [...list, 'detail', lead.id],
        });
      });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);

    const lead = active.data.current?.lead as BoardLead | undefined;
    const stage = stages.find((item) => item.id === over?.id);

    if (!lead || !stage || stage.id === lead.leadStageId) return;

    if (stage.kind === 'disqualified') setDisqualify({ id: lead.id, stageId: stage.id });
    else move(lead, stage.id);
  };

  const add = (stageId: string) =>
    openNewRecord(recordType === 'company' ? 'core:company' : 'core:customer', {
      state: 'lead',
      leadStageId: stageId,
    });

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 gap-3 p-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-full w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setDragging((active.data.current?.lead as BoardLead) ?? null)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div
        className={cn(
          'flex min-h-0 flex-1 gap-3 overflow-x-auto p-3',
          dragging && 'cursor-grabbing',
        )}
      >
        {stages.map((stage) => (
          <StageColumn key={stage.id} recordType={recordType} stage={stage} onAdd={add} />
        ))}
      </div>
      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {dragging && (
          <div
            className={cn(
              CARD,
              'w-[272px] rotate-[1.5deg] cursor-grabbing shadow-lg ring-1 ring-primary/20',
            )}
          >
            <CardBody lead={dragging} />
          </div>
        )}
      </DragOverlay>
      <DisqualifyDialog
        recordType={recordType}
        ids={disqualify ? [disqualify.id] : []}
        stageId={disqualify?.stageId ?? null}
        onClose={() => setDisqualify(null)}
      />
    </DndContext>
  );
};
