import { memberQueries } from '@erxes/core-contract/client';
import { IconChevronRight, IconHierarchy, IconUsers } from '@tabler/icons-react';
import { Badge, Button, cn, MemberInline, Spinner } from 'erxes-ui';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { DraftInput } from './DraftInput';
import { TypeIcon } from './TypeIcon';
import { type TreeRow, treeRows } from './unitTree';
import { useVirtualRows } from './useVirtualRows';

const ROW_HEIGHT = 38;
const DRAFT_HEIGHT = 90;

const keyOf = (row: TreeRow) => (row.kind === 'unit' ? row.unit.id : `${row.kind}:${row.parentId}`);

const indentOf = (depth: number) => `${depth * 1.25 + 0.25}rem`;

type UnitRowProps = Extract<TreeRow, { kind: 'unit' }>;

/** A unit's supervisor, subunits and people with subunits. */
const RowFacts = ({ unit }: { unit: UnitRowProps['unit'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canSeeTeam } = useWorkspace();

  return (
    <>
      {unit.supervisorId && canSeeTeam && (
        <span className="hidden max-w-40 shrink-0 items-center gap-1.5 truncate text-xs text-muted-foreground sm:flex">
          <MemberInline memberId={unit.supervisorId} members={memberQueries} size="default" />
        </span>
      )}
      {unit.childCount > 0 && (
        <span
          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
          title={t('subunit-count', '{{count}} subunits', { count: unit.childCount })}
        >
          <IconHierarchy className="size-3.5" aria-hidden />
          {unit.childCount}
        </span>
      )}
      <span
        className="flex w-10 shrink-0 items-center justify-end gap-1 text-xs text-muted-foreground tabular-nums"
        title={t('headcount', '{{direct}} here, {{all}} with subunits', {
          direct: unit.memberCount,
          all: unit.subtreeMemberCount,
        })}
      >
        <IconUsers className="size-3.5" aria-hidden />
        {unit.subtreeMemberCount}
      </span>
    </>
  );
};

const UnitRow = ({ unit, depth, expanded }: UnitRowProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById, selectedId, select, setOpen, loading } = useWorkspace();
  const selected = selectedId === unit.id;
  const hasChildren = unit.childCount > 0;
  const cssVariables: Record<`--${string}`, string> = { '--indent': indentOf(depth) };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === 'Enter') select(unit.id);

    if (event.key === 'ArrowRight' && hasChildren && !expanded) setOpen(unit, true);

    if (event.key === 'ArrowLeft' && expanded) setOpen(unit, false);
  };

  return (
    <div
      role="treeitem"
      tabIndex={0}
      aria-level={depth + 1}
      aria-selected={selected}
      aria-expanded={hasChildren ? expanded : undefined}
      style={cssVariables}
      className={cn(
        'flex h-9 cursor-pointer items-center gap-2 rounded-md pr-3 pl-(--indent) text-sm outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-primary/10 text-primary-text hover:bg-primary/10',
        !unit.isActive && 'text-muted-foreground',
      )}
      onClick={() => select(unit.id)}
      onKeyDown={onKeyDown}
    >
      {hasChildren ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          tabIndex={-1}
          aria-label={
            expanded
              ? t('collapse-named', 'Collapse {{name}}', { name: unit.name })
              : t('expand-named', 'Show the {{count}} units under {{name}}', {
                  name: unit.name,
                  count: unit.childCount,
                })
          }
          onClick={(event) => {
            event.stopPropagation();
            setOpen(unit, !expanded);
          }}
        >
          {expanded && loading.has(unit.id) ? (
            <Spinner size="sm" />
          ) : (
            <IconChevronRight className={cn('transition-transform', expanded && 'rotate-90')} />
          )}
        </Button>
      ) : (
        <span className="size-6 shrink-0" />
      )}
      <TypeIcon type={unit.typeId ? typesById.get(unit.typeId) : undefined} size="sm" />
      <span className="min-w-0 flex-1 truncate">
        {unit.name}
        {unit.typeId && (
          <span className="ml-2 text-xs text-muted-foreground">
            {typesById.get(unit.typeId)?.name}
          </span>
        )}
      </span>
      {!unit.isActive && <Badge variant="secondary">{t('inactive', 'Inactive')}</Badge>}
      <RowFacts unit={unit} />
    </div>
  );
};

const MoreRow = ({ parentId, depth, left }: Extract<TreeRow, { kind: 'more' }>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { loadMore } = useWorkspace();
  const cssVariables: Record<`--${string}`, string> = { '--indent': indentOf(depth) };

  return (
    <div role="none" className="flex h-9 items-center pl-(--indent)" style={cssVariables}>
      <Button variant="ghost" size="sm" tone="muted" onClick={() => loadMore(parentId)}>
        {t('show-more', 'Show more ({{count}} left)', { count: left })}
      </Button>
    </div>
  );
};

const DraftRow = ({ parentId, depth }: Extract<TreeRow, { kind: 'draft' }>) => {
  const cssVariables: Record<`--${string}`, string> = { '--indent': indentOf(depth) };

  return (
    <div role="none" className="h-22 max-w-sm py-1 pl-(--indent)" style={cssVariables}>
      <DraftInput parentId={parentId} />
    </div>
  );
};

/** One row of the list at its place in the scrolled height. */
const Placed = ({ top, row }: { top: number; row: TreeRow }) => {
  const cssVariables: Record<`--${string}`, string> = { '--row-top': `${top}px` };

  return (
    <div role="none" style={cssVariables} className="absolute inset-x-0 top-(--row-top) pb-0.5">
      {row.kind === 'unit' && <UnitRow {...row} />}
      {row.kind === 'more' && <MoreRow {...row} />}
      {row.kind === 'draft' && <DraftRow {...row} />}
    </div>
  );
};

/**
 * The structure as an indented tree, sharing the chart's open units and selection. Only the rows
 * in view are drawn, so thousands of opened units stay smooth.
 */
export const OrgList = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, isOpen, selectedId, draftParentId, focusId, clearFocus } = useWorkspace();
  const rows = treeRows(index, isOpen, draftParentId);
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const view = useVirtualRows(
    scroller,
    list,
    rows.map((row) => (row.kind === 'draft' ? DRAFT_HEIGHT : ROW_HEIGHT)),
  );

  const focusAt = focusId
    ? rows.findIndex((row) => row.kind === 'unit' && row.unit.id === focusId)
    : -1;

  const { scrollToIndex } = view;

  useEffect(() => {
    if (focusAt < 0) return;

    scrollToIndex(focusAt);
    clearFocus();
  }, [focusAt, scrollToIndex, clearFocus]);

  const cssVariables: Record<`--${string}`, string> = { '--tree-height': `${view.total}px` };

  return (
    <div ref={scroller} className="size-full overflow-auto px-3 pt-16 pb-3">
      <div
        ref={list}
        role="tree"
        aria-label={t('tree-label', 'Organisation structure')}
        style={cssVariables}
        className={cn('relative h-(--tree-height) max-w-3xl', selectedId && 'md:mr-112')}
      >
        {view.items.map((item) => {
          const row = rows[item.index];

          return row ? <Placed key={keyOf(row)} top={item.start} row={row} /> : null;
        })}
      </div>
    </div>
  );
};
