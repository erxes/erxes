import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useId, type ReactNode } from 'react';
import { Button } from '../../components/button';
import { Checkbox } from '../../components/checkbox';
import { useMediaQuery } from '../../hooks/use-media-query';
import { cn } from '../../lib/utils';
import { collapsedGroups, useRecordListContext } from './RecordListProvider';

/** A run of rows under one header, such as the tasks in one status. */
export interface RecordListGroup<TRow> {
  id: string;
  label: string;
  icon?: ReactNode;
  rows: TRow[];
  /** The header's controls on the right, such as a "+" that adds a row to this group. */
  action?: ReactNode;
}

interface RecordListProps<TRow> {
  groups: RecordListGroup<TRow>[];
  rowId: (row: TRow) => string;
  /** The row's name, for its checkbox's label. */
  rowLabel: (row: TRow) => string;
  /** The row's content, after its checkbox. */
  renderRow: (row: TRow) => ReactNode;
  /** False: one list with no headers, such as rows sorted by date. */
  grouped?: boolean;
  className?: string;
}

/**
 * A row's control that shows on hover or focus. A row's own controls (an empty date, say) can
 * use the same classes. A touch screen has no hover, so there they always show.
 */
const revealed =
  'opacity-0 group-hover/list-row:opacity-100 group-focus-within/list-row:opacity-100';

const useHover = () => useMediaQuery('(hover: hover)');

const GroupHeader = ({
  group,
  ids,
  panelId,
  collapsed,
  onCollapse,
}: {
  group: RecordListGroup<unknown>;
  ids: string[];
  panelId: string;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}) => {
  const { selected, toggleAll } = useRecordListContext();
  const hover = useHover();
  const picked = ids.filter((id) => selected.has(id)).length;

  return (
    <div className="group/list-row sticky top-0 z-10 flex h-9 items-center gap-1 border-b bg-muted px-2 text-xs font-medium">
      <span
        className={cn(
          'flex h-9 w-8 shrink-0 items-center justify-center',
          hover && !picked && revealed,
        )}
      >
        <Checkbox
          checked={picked > 0 && picked === ids.length}
          indeterminate={picked > 0 && picked < ids.length}
          aria-label={`Select all in ${group.label}`}
          onCheckedChange={() => toggleAll(ids)}
        />
      </span>
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={!collapsed}
        aria-controls={panelId}
        onClick={() => onCollapse(!collapsed)}
      >
        {collapsed ? <IconChevronRight aria-hidden /> : <IconChevronDown aria-hidden />}
        {group.icon}
        {group.label}
        <span className="text-muted-foreground tabular-nums">{ids.length}</span>
      </Button>
      {group.action && <span className="ml-auto flex items-center">{group.action}</span>}
    </div>
  );
};

const Row = ({
  id,
  label,
  order,
  children,
}: {
  id: string;
  label: string;
  order: string[];
  children: ReactNode;
}) => {
  const { selected, toggle } = useRecordListContext();
  const hover = useHover();
  const checked = selected.has(id);

  return (
    <li
      data-record-row={id}
      data-selected={checked || undefined}
      className="group/list-row flex h-11 items-center gap-1 border-b px-2 text-sm hover:bg-muted data-selected:bg-primary/10"
    >
      <span
        className={cn(
          'flex h-11 w-8 shrink-0 items-center justify-center',
          hover && selected.size === 0 && revealed,
        )}
      >
        {/* Its hit area fills the cell, so a tap anywhere in it toggles the box. */}
        <Checkbox
          className="relative after:absolute after:-inset-x-2 after:-inset-y-3.5"
          checked={checked}
          aria-label={`Select ${label}`}
          onCheckedChange={(_checked, { event }) => {
            const range = event instanceof MouseEvent && event.shiftKey;

            // Shift-click picks a range of rows, not their text.
            if (range) window.getSelection()?.removeAllRanges();

            toggle(id, range ? order : undefined);
          }}
        />
      </span>
      {children}
    </li>
  );
};

/**
 * Rows in groups, each under a sticky header that folds it away and picks all its rows; the
 * folded groups are kept in this browser. Shift-click picks every row between two clicks, as
 * shown. Inside `RecordList.Provider`, which holds the selection a command bar reads.
 */
export const RecordListRoot = <TRow,>({
  groups,
  rowId,
  rowLabel,
  renderRow,
  grouped = true,
  className,
}: RecordListProps<TRow>) => {
  const { listId } = useRecordListContext();
  const [collapsed, setCollapsed] = useAtom(collapsedGroups(listId));
  const prefix = useId();
  const folded = (group: RecordListGroup<TRow>) => grouped && collapsed.includes(group.id);
  const order = groups.filter((group) => !folded(group)).flatMap((group) => group.rows.map(rowId));

  return (
    <div data-record-list={listId} className={className}>
      {groups.map((group) => {
        const panelId = `${prefix}-${group.id}`;

        return (
          <section key={group.id} aria-label={grouped ? group.label : undefined}>
            {grouped && (
              <GroupHeader
                group={group}
                ids={group.rows.map(rowId)}
                panelId={panelId}
                collapsed={folded(group)}
                onCollapse={(fold) =>
                  setCollapsed(
                    fold ? [...collapsed, group.id] : collapsed.filter((id) => id !== group.id),
                  )
                }
              />
            )}
            {!folded(group) && (
              <ul id={panelId}>
                {group.rows.map((row) => (
                  <Row key={rowId(row)} id={rowId(row)} label={rowLabel(row)} order={order}>
                    {renderRow(row)}
                  </Row>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};
