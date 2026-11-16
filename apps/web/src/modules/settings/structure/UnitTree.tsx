import type { Unit, UnitKind, UnitType } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import {
  IconBuilding,
  IconChevronRight,
  IconDots,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsersGroup,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  DropdownMenu,
  MemberInline,
  memberName,
  readImage,
  useConfirm,
  useMembersById,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TypeBadge } from './UnitTypes';
import { childCounts, type UnitRow, useUnitMutations } from './useUnits';

/** The first few members' faces, then how many there are. */
const MemberStack = ({ ids }: { ids: string[] }) => {
  const shown = ids.slice(0, 3);
  const members = useMembersById(shown, memberQueries);

  if (!ids.length) return <span className="text-sm text-muted-foreground">—</span>;

  return (
    <span className="flex items-center gap-2">
      <span className="flex -space-x-1.5">
        {shown.map((id) => {
          const member = members.get(id);

          return (
            <Avatar key={id} size="lg" ring="sm">
              <Avatar.Image src={readImage(member?.avatarUrl)} />
              <Avatar.Fallback>{member ? memberName(member).charAt(0) : ''}</Avatar.Fallback>
            </Avatar>
          );
        })}
      </span>
      <span className="text-sm text-muted-foreground tabular-nums">{ids.length}</span>
    </span>
  );
};

/** A row's menu: edit, add a unit under it, delete. */
const RowMenu = ({
  unit,
  onEdit,
  onAddUnder,
}: {
  unit: Unit;
  onEdit: (unit: Unit) => void;
  onAddUnder: (unit: Unit) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { confirm } = useConfirm();
  const { remove } = useUnitMutations();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('actions', 'Actions for {{name}}', { name: unit.name })}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100"
          />
        }
        onClick={(event) => event.stopPropagation()}
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu.Item onClick={() => onEdit(unit)}>
          <IconPencil />
          {t('edit', 'Edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => onAddUnder(unit)}>
          <IconPlus />
          {unit.kind === 'branch'
            ? t('add-sub-branch', 'Add branch under it')
            : t('add-sub-department', 'Add department under it')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          variant="destructive"
          onClick={() =>
            void confirm({
              message: t(
                'remove-confirm',
                'Delete {{name}}? The units under it move up a level, and plugins drop it from their records.',
                { name: unit.name },
              ),
            }).then(() => remove.mutate({ id: unit.id }))
          }
        >
          <IconTrash />
          {t('remove', 'Delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** The guides and chevron in front of a name: one step per level, a toggle when it has units under it. */
const TreeLead = ({
  row,
  childCount,
  expanded,
  onToggle,
}: {
  row: UnitRow;
  childCount: number;
  expanded: boolean;
  onToggle: (id: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <>
      {Array.from({ length: row.depth }, (_, level) => (
        <span key={level} className="flex h-full w-5 shrink-0 justify-center">
          <span className="h-full w-px bg-border" />
        </span>
      ))}
      {childCount ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-5 shrink-0"
          aria-expanded={expanded}
          aria-label={expanded ? t('collapse', 'Collapse') : t('expand', 'Expand')}
          onClick={(event) => {
            event.stopPropagation();
            onToggle(row.unit.id);
          }}
        >
          <IconChevronRight
            className={expanded ? 'rotate-90 transition-transform' : 'transition-transform'}
          />
        </Button>
      ) : (
        <span className="w-5 shrink-0" />
      )}
    </>
  );
};

const Head = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return (
    <div className="flex h-9 items-center gap-3 border-b bg-muted/40 px-3 text-xs font-medium text-muted-foreground">
      <span className="min-w-0 flex-1">{t('name', 'Name')}</span>
      <span className="hidden w-32 shrink-0 md:block">{t('type', 'Type')}</span>
      <span className="hidden w-44 shrink-0 lg:block">{t('supervisor', 'Supervisor')}</span>
      <span className="w-28 shrink-0">{t('members', 'Members')}</span>
      <span className="w-8 shrink-0" />
    </div>
  );
};

type RowHandlers = {
  canChange: boolean;
  onToggle: (id: string) => void;
  onEdit: (unit: Unit) => void;
  onAddUnder: (unit: Unit) => void;
};

/** One unit: its place in the tree, type, supervisor, members and menu. */
const TreeRow = ({
  row,
  kind,
  type,
  childCount,
  expanded,
  canChange,
  onToggle,
  onEdit,
  onAddUnder,
}: RowHandlers & {
  row: UnitRow;
  kind: UnitKind;
  type: UnitType | undefined;
  childCount: number;
  expanded: boolean;
}) => {
  const { unit } = row;
  const Icon = kind === 'branch' ? IconBuilding : IconUsersGroup;

  return (
    <div
      role="treeitem"
      aria-level={row.depth + 1}
      aria-expanded={childCount ? expanded : undefined}
      aria-selected={false}
      tabIndex={canChange ? 0 : -1}
      onClick={() => canChange && onEdit(unit)}
      onKeyDown={(event) => {
        if (canChange && event.key === 'Enter') onEdit(unit);
      }}
      data-editable={canChange}
      className="group flex h-11 items-center gap-3 border-b px-3 outline-none last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 data-[editable=true]:cursor-pointer"
    >
      <div className="flex h-full min-w-0 flex-1 items-center gap-1.5">
        <TreeLead row={row} childCount={childCount} expanded={expanded} onToggle={onToggle} />
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
          style={type ? { '--type-color': type.color } : undefined}
        >
          <Icon className="size-3.5 text-(--type-color)" />
        </span>
        <span className="truncate text-sm font-medium">{unit.name}</span>
        {unit.code && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{unit.code}</span>
        )}
      </div>
      <div className="hidden w-32 shrink-0 md:block">
        <TypeBadge type={type} />
      </div>
      <div className="hidden w-44 shrink-0 items-center gap-2 truncate text-sm lg:flex">
        {unit.supervisorId ? (
          <MemberInline memberId={unit.supervisorId} members={memberQueries} size="lg" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="w-28 shrink-0">
        <MemberStack ids={unit.memberIds} />
      </div>
      <div className="w-8 shrink-0">
        {canChange && <RowMenu unit={unit} onEdit={onEdit} onAddUnder={onAddUnder} />}
      </div>
    </div>
  );
};

/**
 * Branches or departments as a tree: guides show the levels, a chevron folds a unit's subtree,
 * and a row opens the unit to edit.
 */
export const UnitTree = ({
  kind,
  rows,
  units,
  types,
  collapsed,
  searching,
  ...handlers
}: RowHandlers & {
  kind: UnitKind;
  rows: UnitRow[];
  units: Unit[];
  types: UnitType[];
  collapsed: Set<string>;
  searching: boolean;
}) => {
  const counts = childCounts(units);

  return (
    <div role="tree" className="overflow-hidden rounded-lg border bg-background">
      <Head />
      {rows.map((row) => (
        <TreeRow
          key={row.unit.id}
          row={row}
          kind={kind}
          type={types.find((one) => one.id === row.unit.typeId)}
          childCount={counts.get(row.unit.id) ?? 0}
          expanded={searching || !collapsed.has(row.unit.id)}
          {...handlers}
        />
      ))}
    </div>
  );
};
