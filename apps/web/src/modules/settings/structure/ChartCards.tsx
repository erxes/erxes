import { memberQueries } from '@erxes/core-contract/client';
import { IconChevronDown, IconChevronUp, IconPlus, IconUsers } from '@tabler/icons-react';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Badge, Button, cn, MemberInline, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { CardData, DraftData, MoreData } from './chartLayout';
import { useWorkspace } from './context';
import { DraftInput } from './DraftInput';
import { TypeIcon } from './TypeIcon';

/** Where edges meet a card; drawn, but never shown or connectable. */
const Handles = () => (
  <>
    <Handle
      id="top"
      type="target"
      position={Position.Top}
      isConnectable={false}
      className="opacity-0"
    />
    <Handle
      id="left"
      type="target"
      position={Position.Left}
      isConnectable={false}
      className="opacity-0"
    />
    <Handle type="source" position={Position.Bottom} isConnectable={false} className="opacity-0" />
  </>
);

/** Open or close a unit's subunits; closed, it says how many there are. */
const ToggleButton = ({ data }: { data: CardData }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { setOpen, loading } = useWorkspace();
  const { unit, expanded } = data;

  const label = expanded
    ? t('collapse-named', 'Collapse {{name}}', { name: unit.name })
    : t('expand-named', 'Show the {{count}} units under {{name}}', {
        name: unit.name,
        count: unit.childCount,
      });

  return (
    <Button
      variant="secondary"
      size="xs"
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      onClick={() => setOpen(unit, !expanded)}
    >
      {expanded && loading.has(unit.id) ? (
        <Spinner size="sm" />
      ) : expanded ? (
        <IconChevronUp />
      ) : (
        <>
          <span className="tabular-nums">{unit.childCount}</span>
          <IconChevronDown />
        </>
      )}
    </Button>
  );
};

/** A unit on the chart: its type, name, supervisor and headcount. A click selects it. */
export const UnitCard = ({ data }: NodeProps<Node<CardData, 'card'>>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById, selectedId, select, startDraft, canManage, canSeeTeam } = useWorkspace();
  const { unit } = data;
  const type = unit.typeId ? typesById.get(unit.typeId) : undefined;
  const selected = selectedId === unit.id;

  return (
    <div
      className={cn(
        'relative flex size-full flex-col justify-between rounded-lg border bg-background px-3 py-2.5 shadow-xs transition-colors hover:border-primary',
        selected && 'border-primary ring-2 ring-primary/30',
        !unit.isActive && 'border-dashed bg-muted text-muted-foreground',
      )}
    >
      <Handles />
      <button
        type="button"
        aria-label={unit.name}
        aria-pressed={selected}
        className="absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-ring"
        onClick={() => select(unit.id)}
      />
      <div className="pointer-events-none relative flex min-w-0 items-center gap-2">
        <TypeIcon type={type} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium" title={unit.name}>
          {unit.name}
        </span>
        {!unit.isActive && <Badge variant="secondary">{t('inactive', 'Inactive')}</Badge>}
        {unit.childCount > 0 && (
          <span className="pointer-events-auto">
            <ToggleButton data={data} />
          </span>
        )}
        {canManage && unit.isActive && (
          <span className="pointer-events-auto">
            <Button
              variant="secondary"
              size="icon"
              className="size-6"
              aria-label={t('add-under-named', 'Add a unit under {{name}}', { name: unit.name })}
              title={t('add-subunit', 'Add subunit')}
              onClick={() => startDraft(unit)}
            >
              <IconPlus />
            </Button>
          </span>
        )}
      </div>
      <div className="pointer-events-none relative flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          {unit.supervisorId && canSeeTeam ? (
            <MemberInline memberId={unit.supervisorId} members={memberQueries} size="default" />
          ) : (
            <span className="truncate">{t('no-supervisor', 'No supervisor')}</span>
          )}
        </span>
        {type && <span className="shrink-0 truncate rounded-full border px-1.5">{type.name}</span>}
        <span
          className="flex shrink-0 items-center gap-1 tabular-nums"
          title={t('headcount', '{{direct}} here, {{all}} with subunits', {
            direct: unit.memberCount,
            all: unit.subtreeMemberCount,
          })}
        >
          <IconUsers className="size-3.5" aria-hidden />
          {unit.subtreeMemberCount}
        </span>
      </div>
    </div>
  );
};

/** The units under a parent that haven't loaded yet; a click loads the next page. */
export const MoreCard = ({ data }: NodeProps<Node<MoreData, 'more'>>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { loadMore } = useWorkspace();

  return (
    <div className="size-full">
      <Handles />
      <Button variant="dashed" className="size-full" onClick={() => loadMore(data.parentId)}>
        {t('show-more', 'Show more ({{count}} left)', { count: data.left })}
      </Button>
    </div>
  );
};

/** The "new unit" card where the unit will sit. */
export const DraftCard = ({ data }: NodeProps<Node<DraftData, 'draft'>>) => (
  <div className="size-full">
    <Handles />
    <DraftInput parentId={data.parentId} />
  </div>
);
