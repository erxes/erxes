import { useDroppable } from '@dnd-kit/core';
import { IconPlus } from '@tabler/icons-react';
import { Children, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { Skeleton } from '../../components/skeleton';
import { Tooltip } from '../../components/tooltip';
import { cn } from '../../lib/utils';
import { BoardColumnContext, useBoard } from './boardContext';

const CARD_SKELETONS = ['first', 'second', 'third'];

/** A column's next page, as an infinite query has it. */
type ColumnPages = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
};

/** Loads the next page when the column's end scrolls into view. */
const useLoadMore = (pages: ColumnPages | undefined) => {
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage = false, isFetchingNextPage = false, fetchNextPage } = pages ?? {};

  useEffect(() => {
    const node = sentinel.current;

    if (!node || !hasNextPage || !fetchNextPage) return;

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

const ColumnAdd = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Tooltip>
    <Tooltip.Trigger
      delay={300}
      render={
        <Button
          variant="ghost"
          size="icon"
          tone="muted"
          className="ml-auto"
          aria-label={label}
          onClick={onClick}
        />
      }
    >
      <IconPlus className="size-4" />
    </Tooltip.Trigger>
    <Tooltip.Content>{label}</Tooltip.Content>
  </Tooltip>
);

/**
 * A column of cards, such as one stage. Pass the cards as `Board.Card` children, `empty` for
 * its text without them, and its infinite query as `pages` to load more as it scrolls.
 */
export const BoardColumn = ({
  id,
  title,
  color,
  count,
  subtitle,
  add,
  loading = false,
  error,
  empty,
  pages,
  children,
}: {
  id: string;
  title: string;
  color?: string;
  count?: ReactNode;
  subtitle?: ReactNode;
  add?: { label: string; onClick: () => void };
  loading?: boolean;
  error?: string;
  empty: string;
  pages?: ColumnPages;
  children?: ReactNode;
}) => {
  const { t } = useTranslation('views', { keyPrefix: 'board' });
  const { ordered, target, cards } = useBoard();
  const { setNodeRef } = useDroppable({ id });

  useLayoutEffect(() => cards.addColumn(id, title), [cards, id, title]);

  const sentinel = useLoadMore(pages);
  const here = target?.columnId === id;
  const hasCards = Children.toArray(children).length > 0;

  return (
    <section
      ref={setNodeRef}
      aria-label={title}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-xl border-t-3 border-t-(--column-color) bg-muted/40 transition duration-150',
        here && 'bg-primary/5 inset-ring-2 inset-ring-primary/30',
      )}
      style={{ '--column-color': color ?? 'transparent' }}
    >
      <header className="flex shrink-0 flex-col gap-0.5 py-1.5 pl-3 pr-1.5">
        <span className="flex h-8 items-center gap-2">
          <span className="truncate text-sm font-semibold">{title}</span>
          {count !== undefined && (
            <span className="rounded-full bg-background px-1.5 text-xs tabular-nums text-muted-foreground">
              {count}
            </span>
          )}
          {add && <ColumnAdd {...add} />}
        </span>
        {subtitle && (
          <span className="truncate text-xs tabular-nums text-muted-foreground">{subtitle}</span>
        )}
      </header>
      <div className="styled-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {loading &&
          CARD_SKELETONS.map((key) => <Skeleton key={key} radius="lg" className="h-23 shrink-0" />)}
        {error && <p className="p-2 text-xs text-destructive-text">{error}</p>}
        <BoardColumnContext value={id}>{children}</BoardColumnContext>
        {ordered && here && hasCards && target.beforeId === null && (
          <span className="h-0.5 shrink-0 rounded bg-primary" />
        )}
        {!loading && !hasCards && (
          <div
            className={cn(
              'flex h-24 shrink-0 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground transition-colors',
              here && 'border-primary/40 text-primary-text',
            )}
          >
            {here ? t('drop-here', 'Drop to move here') : empty}
          </div>
        )}
        <div ref={sentinel} className="h-px shrink-0" />
        {pages?.isFetchingNextPage && <Skeleton radius="lg" className="h-23 shrink-0" />}
      </div>
    </section>
  );
};
