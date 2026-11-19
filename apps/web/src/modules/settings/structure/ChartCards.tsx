import type { UnitNode } from '@erxes/core-contract';
import {
  IconChevronDown,
  IconChevronUp,
  IconHierarchy,
  IconPlus,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { Badge, Button, Card, Frame, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  type DraftData,
  FRAME,
  type FrameData,
  type HeadData,
  type MoreData,
  PEOPLE_COLUMNS,
  PEOPLE_MAX,
  PEOPLE_SHOWN,
  PERSON,
} from './chartLayout';
import { useWorkspace } from './context';
import { DraftInput } from './DraftInput';
import { IconCount } from './IconCount';
import { PersonCard } from './PersonCard';
import { TypeIcon } from './TypeIcon';

/** Where edges meet a card; drawn, but never shown or connectable. */
const Handles = () => (
  <>
    <Handle type="target" position={Position.Top} isConnectable={false} className="opacity-0" />
    <Handle type="source" position={Position.Bottom} isConnectable={false} className="opacity-0" />
  </>
);

/** The person who leads a unit, over its frame; an empty place when nobody does. */
export const HeadCard = ({ data }: NodeProps<Node<HeadData, 'head'>>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { select, canManage } = useWorkspace();
  const { unit } = data;
  const leads = t('leads-named', 'Leads {{name}}', { name: unit.name });

  return (
    <div className="size-full">
      <Handles />
      {unit.supervisorId ? (
        <PersonCard id={unit.supervisorId} caption={leads} />
      ) : (
        <Card variant="outline" dashed className="size-full">
          <div className="flex size-full items-center gap-2.5 px-3 text-muted-foreground">
            <IconUserPlus className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm">
              {t('no-supervisor', 'No supervisor')}
            </span>
            {canManage && (
              <Button variant="outline" size="sm" onClick={() => select(unit.id)}>
                {t('assign', 'Assign')}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

/** Open or close a unit; closed, it says how many units sit under it. */
const ToggleButton = ({ unit, expanded }: { unit: UnitNode; expanded: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { setOpen, isOpen } = useWorkspace();
  const opening = isOpen(unit) && !expanded;

  const label = expanded
    ? t('collapse-named', 'Collapse {{name}}', { name: unit.name })
    : t('open-named', 'Open {{name}}', { name: unit.name });

  return (
    <Button
      variant="secondary"
      size="xs"
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      onClick={() => setOpen(unit, !isOpen(unit))}
    >
      {opening ? <Spinner size="sm" /> : expanded ? <IconChevronUp /> : <IconChevronDown />}
    </Button>
  );
};

/** How many people and units a frame holds, then opening it and adding a unit under it. */
const FrameBar = ({ data }: { data: FrameData }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { startDraft, canManage, showsAllPeople, toggleAllPeople } = useWorkspace();
  const { unit, expanded, people } = data;

  return (
    <div className="relative flex h-(--frame-top) items-center justify-end gap-2 px-(--frame-pad) pt-3 text-xs text-muted-foreground">
      {expanded && showsAllPeople(unit.id) && people.length > PEOPLE_SHOWN && (
        <Button variant="ghost" size="sm" tone="muted" onClick={() => toggleAllPeople(unit.id)}>
          {t('show-fewer', 'Show fewer')}
        </Button>
      )}
      <IconCount
        icon={<IconUsers className="size-3.5" aria-hidden />}
        title={t('headcount', '{{direct}} here, {{all}} with subunits', {
          direct: unit.memberCount,
          all: unit.subtreeMemberCount,
        })}
      >
        {unit.subtreeMemberCount}
      </IconCount>
      {unit.childCount > 0 && (
        <IconCount
          icon={<IconHierarchy className="size-3.5" aria-hidden />}
          title={t('subunit-count', '{{count}} subunits', { count: unit.childCount })}
        >
          {unit.childCount}
        </IconCount>
      )}
      {(unit.childCount > 0 || unit.memberCount > 0) && (
        <ToggleButton unit={unit} expanded={expanded} />
      )}
      {canManage && unit.isActive && (
        <Button
          variant="ghost"
          size="icon"
          tone="muted"
          className="size-6"
          aria-label={t('add-under-named', 'Add a unit under {{name}}', { name: unit.name })}
          title={t('add-subunit', 'Add subunit')}
          onClick={() => startDraft(unit)}
        >
          <IconPlus />
        </Button>
      )}
    </div>
  );
};

/** The people in a frame, a few to a row, then how to see the rest. */
const PeopleGrid = ({ data }: { data: FrameData }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toggleAllPeople, select } = useWorkspace();
  const { unit, people, total } = data;

  return (
    <div className="relative flex flex-col px-(--frame-pad) pb-(--frame-pad)">
      <div className="grid grid-cols-(--people-columns) gap-(--person-gap)">
        {people.map((id) => (
          <div key={id} className="h-(--person-height) w-(--person-width)">
            <PersonCard id={id} />
          </div>
        ))}
      </div>
      {!total && (
        <p className="flex h-(--frame-line) items-center text-xs text-muted-foreground">
          {t('nobody-else-here', 'Nobody else is in this unit itself.')}
        </p>
      )}
      {total > people.length && (
        <div className="flex h-(--frame-line) items-end">
          {people.length >= PEOPLE_MAX ? (
            <Button variant="ghost" size="sm" tone="muted" onClick={() => select(unit.id)}>
              {t('more-people-in-tab', '{{count}} more in its People tab', {
                count: total - people.length,
              })}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" tone="muted" onClick={() => toggleAllPeople(unit.id)}>
              {t('show-all-count', 'Show all {{count}}', { count: total })}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * A unit on the chart: a dashed frame named after it, holding its people. A click on its name
 * selects it; with Shift or Ctrl held, it joins the units picked together.
 */
export const UnitFrame = ({ data }: NodeProps<Node<FrameData, 'frame'>>) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { typesById, selectedId, clickUnit, picked } = useWorkspace();
  const { unit, expanded, people } = data;
  const type = unit.typeId ? typesById.get(unit.typeId) : undefined;
  const selected = selectedId === unit.id || picked.has(unit.id);

  const cssVariables: Record<`--${string}`, string> = {
    '--person-width': `${PERSON.width}px`,
    '--person-height': `${PERSON.height}px`,
    '--person-gap': `${PERSON.gap}px`,
    '--frame-top': `${FRAME.top}px`,
    '--frame-pad': `${FRAME.pad}px`,
    '--frame-line': `${FRAME.line}px`,
    '--people-columns': `repeat(${Math.min(Math.max(people.length, 1), PEOPLE_COLUMNS)}, max-content)`,
  };

  return (
    <Frame selected={selected} className="size-full" style={cssVariables}>
      <Handles />
      <Frame.Label>
        <button
          type="button"
          aria-label={unit.name}
          aria-pressed={selected}
          className="absolute inset-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-ring"
          onClick={(event) => clickUnit(unit, event)}
        />
        <TypeIcon type={type} size="sm" />
        <span className="truncate" title={unit.name}>
          {unit.name}
        </span>
        {type && (
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{type.name}</span>
        )}
        {!unit.isActive && (
          <Badge variant="secondary" size="sm">
            {t('inactive', 'Inactive')}
          </Badge>
        )}
      </Frame.Label>
      <FrameBar data={data} />
      {expanded && <PeopleGrid data={data} />}
    </Frame>
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

/** The new unit's box where the unit will sit. */
export const DraftCard = ({ data }: NodeProps<Node<DraftData, 'draft'>>) => (
  <Card variant="outline" dashed selected className="relative size-full">
    <Handles />
    <div className="flex size-full px-3 py-2.5">
      <DraftInput parentId={data.parentId} stacked />
    </div>
  </Card>
);
