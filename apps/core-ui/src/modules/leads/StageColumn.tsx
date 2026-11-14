import type { LeadRecordType, LeadStage } from '@erxes/core-contract';
import { useDroppable } from '@dnd-kit/core';
import { IconPlus } from '@tabler/icons-react';
import { type InfiniteData, skipToken, useInfiniteQuery } from '@tanstack/react-query';
import { Button, cn, Skeleton, Tooltip } from 'erxes-ui';
import { memo, useEffect, useRef } from 'react';
import { messageOf, orpc } from '~/lib/api';
import { type CursorPage, formatTotal, forwardPaging } from '~/lib/cursorList';
import { useCompaniesFilters } from '~/modules/contacts/companies/useCompanies';
import { useCustomersFilters } from '~/modules/contacts/customers/useCustomers';
import { useLeadsT, useStageName } from './i18n';
import { LeadCard } from './LeadCard';
import type { BoardLead } from './useBoardMove';

const PAGE = 30;

const CARD_SKELETONS = ['first', 'second', 'third'];

const column = ({ pages }: Pick<InfiniteData<CursorPage<BoardLead>>, 'pages'>) => ({
  leads: pages.flatMap((page) => page.data),
  total: pages[0],
});

/** One stage's leads, newest first, a page at a time (with the list's search, tags, owner and advanced filter). */
const useStageLeads = (recordType: LeadRecordType, stageId: string) => {
  const paging = forwardPaging(PAGE);
  const people = { ...useCustomersFilters('lead'), leadStageId: stageId };
  const companyFilters = { ...useCompaniesFilters('lead'), leadStageId: stageId };

  const customers = useInfiniteQuery(
    orpc.customers.list.infiniteOptions({
      input: recordType === 'customer' ? (page) => ({ ...page, ...people }) : skipToken,
      ...paging,
      select: column,
    }),
  );

  const companies = useInfiniteQuery(
    orpc.companies.list.infiniteOptions({
      input: recordType === 'company' ? (page) => ({ ...page, ...companyFilters }) : skipToken,
      ...paging,
      select: column,
    }),
  );

  return recordType === 'company' ? companies : customers;
};

/** Loads the next page when the column's end scrolls into view. */
const useLoadMoreSentinel = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}) => {
  const sentinel = useRef<HTMLDivElement>(null);

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

  return sentinel;
};

const ColumnHeader = ({
  stage,
  count,
  onAdd,
}: {
  stage: LeadStage;
  count: string;
  onAdd: () => void;
}) => {
  const t = useLeadsT();
  const stageName = useStageName();

  return (
    <header className="flex h-11 shrink-0 items-center gap-2 pl-3 pr-1.5">
      <span className="truncate text-sm font-semibold">{stageName(stage.name)}</span>
      <span className="rounded-full bg-background px-1.5 text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
      <Tooltip>
        <Tooltip.Trigger
          delay={300}
          render={
            <Button
              variant="ghost"
              size="icon"
              tone="muted"
              className="ml-auto"
              aria-label={t('board.add-here')}
              onClick={onAdd}
            />
          }
        >
          <IconPlus className="size-4" />
        </Tooltip.Trigger>
        <Tooltip.Content>{t('board.add-here')}</Tooltip.Content>
      </Tooltip>
    </header>
  );
};

export const StageColumn = memo(function StageColumn({
  recordType,
  stage,
  onAdd,
}: {
  recordType: LeadRecordType;
  stage: LeadStage;
  onAdd: (stageId: string) => void;
}) {
  const t = useLeadsT();
  const query = useStageLeads(recordType, stage.id);
  const { setNodeRef, isOver, active } = useDroppable({ id: stage.id });
  const leads = query.data?.leads ?? [];
  const first = query.data?.total;
  const target = isOver && !leads.some((lead) => lead.id === active?.id);
  const sentinel = useLoadMoreSentinel(query);

  return (
    <section
      ref={setNodeRef}
      aria-label={stage.name}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-xl border-t-[3px] bg-muted/40 transition-[background-color,box-shadow] duration-150',
        target && 'bg-primary/5 shadow-[inset_0_0_0_2px] shadow-primary/30',
      )}
      style={{ borderTopColor: stage.color }}
    >
      <ColumnHeader
        stage={stage}
        count={first ? formatTotal(first.totalCount, first.totalCapped) : '·'}
        onAdd={() => onAdd(stage.id)}
      />
      <div className="styled-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {query.isPending &&
          CARD_SKELETONS.map((key) => (
            <Skeleton key={key} radius="lg" className="h-[92px] shrink-0" />
          ))}
        {query.error && <p className="p-2 text-xs text-destructive">{messageOf(query.error)}</p>}
        {leads.map((lead) => (
          <LeadCard key={lead.id} recordType={recordType} lead={lead} />
        ))}
        {!query.isPending && !leads.length && (
          <div
            className={cn(
              'flex h-24 shrink-0 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground transition-colors',
              target && 'border-primary/40 text-primary-text',
            )}
          >
            {target ? t('board.drop-here') : t('board.empty')}
          </div>
        )}
        <div ref={sentinel} className="h-px shrink-0" />
        {query.isFetchingNextPage && <Skeleton radius="lg" className="h-[92px] shrink-0" />}
      </div>
    </section>
  );
});
