import {
  IconAlertTriangle,
  IconArrowsSplit,
  IconBolt,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconGitBranch,
  IconHandStop,
  IconHourglass,
  IconPlus,
  IconRoute,
} from '@tabler/icons-react';
import { cn, DropdownMenu } from 'erxes-ui';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { STEP_TITLES, type StepType } from './flowModel';

type NodeIcon = ComponentType<{ className?: string }>;

/** How each kind of node looks: icon and colour (actions, waits, logic, ends). */
export const LOOK: Record<StepType | 'trigger', { icon: NodeIcon; tone: string }> = {
  trigger: { icon: IconBolt, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  action: { icon: IconBolt, tone: 'bg-primary/10 text-primary' },
  delay: { icon: IconClock, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  wait_for: { icon: IconHourglass, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  branch: { icon: IconGitBranch, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  switch: { icon: IconRoute, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  split: { icon: IconArrowsSplit, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  stop: { icon: IconHandStop, tone: 'bg-muted text-muted-foreground' },
};

const ADD_CHOICES: { type: StepType; hint: string }[] = [
  { type: 'action', hint: 'Do something: email, tag, assign, call a plugin' },
  { type: 'delay', hint: 'Pause for minutes, hours or days' },
  { type: 'wait_for', hint: 'Until something happens to the record' },
  { type: 'branch', hint: 'Yes or no, by conditions' },
  { type: 'switch', hint: 'One of several paths' },
  { type: 'split', hint: 'Test two versions (A/B)' },
  { type: 'stop', hint: 'End the run' },
];

/** The "+" between nodes: a menu of step kinds to insert there. */
const AddButton = ({ onAdd }: { onAdd: (type: StepType) => void }) => {
  const { t } = useTranslation('automations');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t('add-step', 'Add step')}
          className={cn(
            'relative z-10 flex size-6 items-center justify-center gap-1 rounded-full border bg-background text-muted-foreground shadow-xs transition',
            'hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none',
          )}
        >
          <IconPlus className="size-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="center" className="w-72">
        {ADD_CHOICES.map(({ type, hint }) => {
          const Icon = LOOK[type].icon;

          return (
            <DropdownMenu.Item
              key={type}
              onClick={() => onAdd(type)}
              className="items-start gap-3 py-2"
            >
              <span
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
                  LOOK[type].tone,
                )}
              >
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">
                  {t(`step-type.${type}`, STEP_TITLES[type])}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`step-hint.${type}`, hint)}
                </span>
              </span>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** A vertical line, with a "+" in the middle when steps may be added here. */
export const Connector = ({
  onAdd,
  height = 'h-10',
}: {
  onAdd?: (type: StepType) => void;
  height?: string;
}) => (
  <div className={cn('relative flex w-full shrink-0 items-center justify-center', height)}>
    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
    {onAdd && <AddButton onAdd={onAdd} />}
  </div>
);

/** Runs of the last 30 days: succeeded, and failed when any. */
const NodeStats = ({ stats }: { stats: { succeeded: number; failed: number } }) => (
  <>
    <span className="flex items-center gap-1">
      <IconCircleCheck className="size-3.5 text-success" />
      {stats.succeeded}
    </span>
    {stats.failed > 0 && (
      <span className="flex items-center gap-1 text-destructive">
        <IconCircleX className="size-3.5" />
        {stats.failed}
      </span>
    )}
  </>
);

/** A card on the canvas: the trigger or a step; selecting it opens its settings. */
export const Node = ({
  kind,
  icon: Icon,
  tone,
  title,
  detail,
  selected,
  problems,
  stats,
  onSelect,
}: {
  kind: string;
  icon: NodeIcon;
  tone: string;
  title: string;
  detail: string | null;
  selected: boolean;
  problems?: string[];
  stats?: { succeeded: number; failed: number };
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      onSelect();
    }}
    title={problems?.join('\n')}
    className={cn(
      'relative z-10 w-72 shrink-0 rounded-xl border bg-background text-left shadow-xs transition',
      'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
      selected && 'border-primary ring-2 ring-primary/20',
      problems?.length && !selected && 'border-destructive/60',
    )}
  >
    <div className="flex items-start gap-3 p-3">
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {kind}
        </span>
        <span className="line-clamp-2 block text-sm font-medium break-words">{title}</span>
        {detail && <span className="block truncate text-xs text-muted-foreground">{detail}</span>}
      </span>
      {!!problems?.length && <IconAlertTriangle className="size-4 shrink-0 text-destructive" />}
    </div>
    {stats && (
      <span className="flex items-center gap-3 border-t px-3 py-1.5 text-[11px] text-muted-foreground">
        <NodeStats stats={stats} />
      </span>
    )}
  </button>
);
