import { memberQueries } from '@erxes/core-contract/client';
import { IconPlus } from '@tabler/icons-react';
import { Badge, Button, MemberInline, Tree } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkspace } from './context';
import { DraftInput } from './DraftInput';
import { TypeIcon } from './TypeIcon';
import { type TreeRow, treeRows } from './unitTree';
import { useVirtualRows } from './useVirtualRows';

const ROW_HEIGHT = 38;

const keyOf = (row: TreeRow) => (row.kind === 'unit' ? row.unit.id : `${row.kind}:${row.parentId}`);

type UnitRowProps = Extract<TreeRow, { kind: 'unit' }>;

/** The columns after the name; the narrower the tree, the fewer show. */
const Columns = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { canSeeTeam } = useWorkspace();

  return (
    <Tree.Header className="mx-2">
      <span className="min-w-0 flex-1 truncate">{t('unit', 'Unit')}</span>
      <span className="hidden w-32 shrink-0 truncate @2xl:block">{t('type', 'Type')}</span>
      {canSeeTeam && (
        <span className="hidden w-44 shrink-0 truncate @xl:block">
          {t('supervisor', 'Supervisor')}
        </span>
      )}
      <span className="w-16 shrink-0 truncate text-right">{t('subunits', 'Subunits')}</span>
      <span className="w-16 shrink-0 truncate text-right">{t('people', 'People')}</span>
      <span className="size-6 shrink-0" />
    </Tree.Header>
  );
};

/** A unit's type, supervisor, subunits and people, under the headings of `Columns`. */
const RowCells = ({ unit }: { unit: UnitRowProps['unit'] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById, canSeeTeam } = useWorkspace();

  return (
    <>
      <span className="hidden w-32 shrink-0 truncate text-muted-foreground @2xl:block">
        {unit.typeId ? typesById.get(unit.typeId)?.name : null}
      </span>
      {canSeeTeam && (
        <span className="hidden w-44 shrink-0 items-center gap-1.5 truncate text-muted-foreground @xl:flex">
          {unit.supervisorId ? (
            <MemberInline memberId={unit.supervisorId} members={memberQueries} size="default" />
          ) : (
            '—'
          )}
        </span>
      )}
      <span className="w-16 shrink-0 text-right text-muted-foreground tabular-nums">
        {unit.childCount || '—'}
      </span>
      <span
        className="w-16 shrink-0 text-right tabular-nums"
        title={t('headcount', '{{direct}} here, {{all}} with subunits', {
          direct: unit.memberCount,
          all: unit.subtreeMemberCount,
        })}
      >
        {unit.subtreeMemberCount}
      </span>
    </>
  );
};

const UnitRow = ({ unit, depth, expanded }: UnitRowProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById, selectedId, select, setOpen, loading, startDraft, canManage } = useWorkspace();
  const hasChildren = unit.childCount > 0;

  return (
    <Tree.Row
      depth={depth}
      expanded={hasChildren ? expanded : undefined}
      onExpandedChange={(open) => setOpen(unit, open)}
      expandLabel={
        expanded
          ? t('collapse-named', 'Collapse {{name}}', { name: unit.name })
          : t('expand-named', 'Show the {{count}} units under {{name}}', {
              name: unit.name,
              count: unit.childCount,
            })
      }
      loading={expanded && loading.has(unit.id)}
      selected={selectedId === unit.id}
      muted={!unit.isActive}
      onSelect={() => select(unit.id)}
    >
      <TypeIcon type={unit.typeId ? typesById.get(unit.typeId) : undefined} size="sm" />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate">{unit.name}</span>
        {!unit.isActive && <Badge variant="secondary">{t('inactive', 'Inactive')}</Badge>}
      </span>
      <RowCells unit={unit} />
      {canManage && unit.isActive ? (
        <Button
          variant="ghost"
          size="icon"
          tone="muted"
          className="size-6 shrink-0 opacity-0 group-hover/tree-row:opacity-100 focus-visible:opacity-100"
          aria-label={t('add-under-named', 'Add a unit under {{name}}', { name: unit.name })}
          title={t('add-subunit', 'Add subunit')}
          onClick={(event) => {
            event.stopPropagation();
            startDraft(unit);
          }}
        >
          <IconPlus />
        </Button>
      ) : (
        <span className="size-6 shrink-0" />
      )}
    </Tree.Row>
  );
};

const MoreRow = ({ parentId, depth, left }: Extract<TreeRow, { kind: 'more' }>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { loadMore } = useWorkspace();

  return (
    <Tree.Line depth={depth}>
      <Button variant="ghost" size="sm" tone="muted" onClick={() => loadMore(parentId)}>
        {t('show-more', 'Show more ({{count}} left)', { count: left })}
      </Button>
    </Tree.Line>
  );
};

/** One row of the tree at its place in the scrolled height. */
const Placed = ({ top, row }: { top: number; row: TreeRow }) => {
  const cssVariables: Record<`--${string}`, string> = { '--row-top': `${top}px` };

  return (
    <div role="none" style={cssVariables} className="absolute inset-x-0 top-(--row-top)">
      {row.kind === 'unit' && <UnitRow {...row} />}
      {row.kind === 'more' && <MoreRow {...row} />}
      {row.kind === 'draft' && (
        <Tree.Line depth={row.depth}>
          <DraftInput parentId={row.parentId} />
        </Tree.Line>
      )}
    </div>
  );
};

/**
 * The structure as a tree with columns, sharing the chart's open units and selection. Only the
 * rows in view are drawn, so thousands of opened units stay smooth.
 */
export const OrgList = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { index, isOpen, draftParentId, focusId, clearFocus } = useWorkspace();
  const rows = treeRows(index, isOpen, draftParentId);
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const view = useVirtualRows(
    scroller,
    list,
    rows.map(() => ROW_HEIGHT),
  );

  const draftAt = rows.findIndex((row) => row.kind === 'draft');
  const shownDraftAt = useRef(-1);

  const focusAt = focusId
    ? rows.findIndex((row) => row.kind === 'unit' && row.unit.id === focusId)
    : -1;

  const { scrollToIndex } = view;

  useEffect(() => {
    if (focusAt < 0) return;

    scrollToIndex(focusAt);
    clearFocus();
  }, [focusAt, scrollToIndex, clearFocus]);

  useEffect(() => {
    if (shownDraftAt.current === draftAt) return;

    shownDraftAt.current = draftAt;

    if (draftAt >= 0) scrollToIndex(draftAt);
  }, [draftAt, scrollToIndex, shownDraftAt]);

  const cssVariables: Record<`--${string}`, string> = { '--tree-height': `${view.total}px` };

  return (
    <div className="@container flex size-full flex-col">
      <Columns />
      <div ref={scroller} className="min-h-0 flex-1 overflow-auto p-2">
        <Tree
          ref={list}
          aria-label={t('tree-label', 'Organisation structure')}
          style={cssVariables}
          className="relative h-(--tree-height)"
        >
          {view.items.map((item) => {
            const row = rows[item.index];

            return row ? <Placed key={keyOf(row)} top={item.start} row={row} /> : null;
          })}
        </Tree>
      </div>
    </div>
  );
};
