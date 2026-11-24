import type { ActionInfo } from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Command, Popover } from 'erxes-ui';
import { type ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { catalogIcon, matchWords, useRecent } from './catalogGroups';
import { STEP_TITLES, type StepType } from './flowModel';
import { LOOK } from './stepLook';

const LOGIC: StepType[] = ['delay', 'wait_for', 'branch', 'switch', 'split', 'stop'];
const TOP_ACTIONS = 6;

export type AddStep = (type: StepType, action?: string) => void;

/** The recently used actions first, then the rest in catalog order. */
const topActions = (actions: ActionInfo[], recent: string[]) => [
  ...recent.flatMap((type) => actions.find((item) => item.type === type) ?? []),
  ...actions.filter((item) => !recent.includes(item.type)),
];

const Tile = ({
  value,
  keywords,
  label,
  icon: Icon,
  tone,
  onSelect,
}: {
  value: string;
  keywords: string[];
  label: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  onSelect: () => void;
}) => (
  <Command.Item variant="card" value={value} keywords={keywords} onSelect={onSelect}>
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tone)}>
      <Icon className="size-4" />
    </span>
    <span className="line-clamp-2 leading-tight">{label}</span>
  </Command.Item>
);

const ActionGroup = ({ actions, onAdd }: { actions: ActionInfo[]; onAdd: AddStep }) => {
  const { t } = useTranslation('automations');

  return (
    <Command.Group heading={t('step-kind-action', 'Do this')} layout="cards">
      {actions.map((action) => (
        <Tile
          key={action.type}
          value={action.type}
          keywords={[action.label, action.description ?? '']}
          label={action.label}
          icon={catalogIcon(action)}
          tone={LOOK.action.tone}
          onSelect={() => onAdd('action', action.type)}
        />
      ))}
    </Command.Group>
  );
};

const LogicGroup = ({ onAdd }: { onAdd: AddStep }) => {
  const { t } = useTranslation('automations');

  return (
    <Command.Group heading={t('logic', 'Logic')} layout="cards">
      {LOGIC.map((type) => {
        const label = t(`step-type.${type}`, STEP_TITLES[type]);

        return (
          <Tile
            key={type}
            value={`step:${type}`}
            keywords={[label]}
            label={label}
            icon={LOOK[type].icon}
            tone={LOOK[type].tone}
            onSelect={() => onAdd(type)}
          />
        );
      })}
    </Command.Group>
  );
};

/** The "+" on a line: actions and logic as tiles, with a search across every action. */
export const StepPicker = ({ actions, onAdd }: { actions: ActionInfo[]; onAdd: AddStep }) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { recent, remember } = useRecent('action');
  const listed = topActions(actions, recent);
  const shown = search ? listed : listed.slice(0, TOP_ACTIONS);

  const add = (type: StepType, action?: string) => {
    if (action) remember(action);
    onAdd(type, action);
    setOpen(false);
  };

  const actionGroup = <ActionGroup key="actions" actions={shown} onAdd={add} />;
  const logic = <LogicGroup key="logic" onAdd={add} />;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setSearch('');
      }}
    >
      <Popover.Trigger
        aria-label={t('add-step', 'Add a step')}
        render={<Button variant="insert" size="icon" className="relative z-10 size-6" />}
      >
        <IconPlus className="size-3.5" />
      </Popover.Trigger>
      <Popover.Content
        variant="flush"
        align="center"
        sideOffset={6}
        collisionPadding={12}
        className="flex max-h-(--available-height) w-80 flex-col"
      >
        <Command loop filter={matchWords} className="min-h-0 flex-1">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={t('search-actions', 'Search actions')}
            focusOnMount
          />
          <Command.List className="max-h-none min-h-0 flex-1 overflow-y-auto">
            <Command.Empty>{t('no-matches', 'No matches')}</Command.Empty>
            {search ? [logic, actionGroup] : [actionGroup, logic]}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
