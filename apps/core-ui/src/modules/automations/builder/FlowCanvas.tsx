import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconAlertTriangle,
  IconArrowsSplit,
  IconBolt,
  IconCalendarEvent,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconFlag,
  IconGitBranch,
  IconHandFinger,
  IconHandStop,
  IconHourglass,
  IconPlus,
  IconRoute,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import { Button, cn, DropdownMenu } from 'erxes-ui';
import { type ComponentType, Fragment, type ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLeadStages } from '~/modules/leads/useLeads';
import { catalogIcon } from './CatalogPicker';
import { armsOf, describeStep, type ListAddress, STEP_TITLES, type StepType } from './flowModel';
import { BuilderContext } from './StepSettings';
import type { FieldInfo } from './useAutomationFields';

/** How each kind of node looks: icon and colour (actions, waits, logic, ends). */
const LOOK: Record<StepType | 'trigger', { icon: ComponentType<{ className?: string }>; tone: string }> = {
  trigger: { icon: IconBolt, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  action: { icon: IconBolt, tone: 'bg-primary/10 text-primary' },
  delay: { icon: IconClock, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  wait_for: { icon: IconHourglass, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  branch: { icon: IconGitBranch, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  switch: { icon: IconRoute, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  split: { icon: IconArrowsSplit, tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  stop: { icon: IconHandStop, tone: 'bg-muted text-muted-foreground' },
};

const TRIGGER_ICONS = { event: IconBolt, schedule: IconClock, date: IconCalendarEvent, manual: IconHandFinger } as const;

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
const AddButton = ({ onAdd, label }: { onAdd: (type: StepType) => void; label?: string }) => {
  const { t } = useTranslation('automations');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t('add-step', 'Add step')}
          className={cn(
            'relative z-10 flex items-center justify-center gap-1 rounded-full border bg-background text-muted-foreground shadow-xs transition',
            'hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none',
            label ? 'h-7 px-3 text-xs' : 'size-6',
          )}
        >
          <IconPlus className="size-3.5" />
          {label}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="center" className="w-72">
        {ADD_CHOICES.map(({ type, hint }) => {
          const Icon = LOOK[type].icon;

          return (
            <DropdownMenu.Item key={type} onClick={() => onAdd(type)} className="items-start gap-3 py-2">
              <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md', LOOK[type].tone)}>
                <Icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{t(`step-type.${type}`, STEP_TITLES[type])}</span>
                <span className="block text-xs text-muted-foreground">{t(`step-hint.${type}`, hint)}</span>
              </span>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** A vertical line, with a "+" in the middle when steps may be added here. */
const Connector = ({ onAdd, height = 'h-10' }: { onAdd?: (type: StepType) => void; height?: string }) => (
  <div className={cn('relative flex w-full shrink-0 items-center justify-center', height)}>
    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
    {onAdd && <AddButton onAdd={onAdd} />}
  </div>
);

const Node = ({
  kind,
  icon: Icon,
  tone,
  title,
  detail,
  selected,
  problems,
  stats,
  onSelect,
  footer,
}: {
  kind: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
  title: string;
  detail: string | null;
  selected: boolean;
  problems?: string[];
  stats?: { succeeded: number; failed: number };
  onSelect: () => void;
  footer?: ReactNode;
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
        <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{kind}</span>
        <span className="line-clamp-2 block text-sm font-medium break-words">{title}</span>
        {detail && <span className="block truncate text-xs text-muted-foreground">{detail}</span>}
      </span>
      {!!problems?.length && <IconAlertTriangle className="size-4 shrink-0 text-destructive" />}
    </div>
    {(stats || footer) && (
      <span className="flex items-center gap-3 border-t px-3 py-1.5 text-[11px] text-muted-foreground">
        {stats && (
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
        )}
        {footer}
      </span>
    )}
  </button>
);

interface FlowProps {
  actions: ActionInfo[];
  fields: FieldInfo[];
  selected: string | null;
  problems: Map<string, string[]>;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onAdd: (address: ListAddress, index: number, type: StepType) => void;
}

/** One list of steps, top to bottom; branching steps open into side-by-side arms. */
const StepList = ({ steps, address, flow, root }: { steps: AutomationStep[]; address: ListAddress; flow: FlowProps; root?: boolean }) => {
  const { t } = useTranslation('automations');
  const { events, stats, outputsBefore } = useContext(BuilderContext);
  const add = (index: number) => (flow.disabled ? undefined : (type: StepType) => flow.onAdd(address, index, type));
  const { stages } = useLeadStages();

  return (
    <div className="flex flex-col items-center">
      {steps.map((step, index) => {
        const { title, detail } = describeStep(step, { actions: flow.actions, events, fields: [...flow.fields, ...outputsBefore(step.id)], stages });
        const arms = armsOf(step);
        const look = LOOK[step.type];
        const action = step.type === 'action' ? flow.actions.find((item) => item.type === step.action) : undefined;

        return (
          <Fragment key={step.id}>
            <Connector onAdd={add(index)} />
            <Node
              kind={step.type === 'action' ? (action && action.source !== 'core' ? action.source : t('step-type.action', 'Action')) : t(`step-type.${step.type}`, STEP_TITLES[step.type])}
              icon={action ? catalogIcon(action) : look.icon}
              tone={look.tone}
              title={title}
              detail={detail}
              selected={flow.selected === step.id}
              problems={flow.problems.get(step.id)}
              stats={stats.get(step.id)}
              onSelect={() => flow.onSelect(step.id)}
            />
            {arms.length > 0 && (
              <>
                <div className="h-5 w-px shrink-0 bg-border" />
                <div className="flex items-stretch">
                  {arms.map((arm, at) => (
                    <div key={arm.key} className="relative flex flex-col items-center px-4">
                      <div className="absolute top-0 h-px bg-border" style={{ left: at === 0 ? '50%' : 0, right: at === arms.length - 1 ? '50%' : 0 }} />
                      <div className="h-4 w-px shrink-0 bg-border" />
                      <span className="relative z-10 rounded-full border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">{arm.label}</span>
                      <StepList steps={arm.steps} address={{ parentId: step.id, arm: arm.key }} flow={flow} />
                      <div className="min-h-4 w-px flex-1 bg-border" />
                      <div className="absolute bottom-0 h-px bg-border" style={{ left: at === 0 ? '50%' : 0, right: at === arms.length - 1 ? '50%' : 0 }} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </Fragment>
        );
      })}
      <Connector onAdd={add(steps.length)} height={root ? 'h-10' : 'h-8'} />
      {root && (
        <span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
          <IconFlag className="size-3.5" />
          {t('end', 'End')}
        </span>
      )}
    </div>
  );
};

/**
 * The automation as a flow: the trigger, then each step as a card, top to
 * bottom; branches, cases and A/B paths side by side. "+" on any line adds a
 * step there; a card opens its settings in the inspector.
 */
export const FlowCanvas = ({
  trigger,
  steps,
  zoom,
  onZoom,
  onDeselect,
  ...flow
}: FlowProps & {
  trigger: { kind: keyof typeof TRIGGER_ICONS; title: string; detail: string | null; problems?: string[] };
  steps: AutomationStep[];
  zoom: number;
  onZoom: (zoom: number) => void;
  onDeselect: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="relative min-h-0 flex-1">
      <div
        className="absolute inset-0 overflow-auto"
        // Only clicks on the empty canvas (menus are portals: their clicks bubble here through React).
        onClick={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest('[data-canvas-empty]')) onDeselect();
        }}
        data-canvas-empty
        style={{ backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
      >
        <div className="flex min-w-max justify-center px-10 py-8" style={{ zoom }} data-canvas-empty>
          <div className="flex flex-col items-center">
            <Node
              kind={t('trigger-kind', 'Trigger')}
              icon={TRIGGER_ICONS[trigger.kind]}
              tone={LOOK.trigger.tone}
              title={trigger.title}
              detail={trigger.detail}
              selected={flow.selected === 'trigger'}
              problems={trigger.problems}
              onSelect={() => flow.onSelect('trigger')}
            />
            <StepList steps={steps} address={{ parentId: null, arm: null }} flow={flow} root />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-lg border bg-background p-1 shadow-xs">
        <Button size="icon" variant="ghost" className="size-7" aria-label={t('zoom-out', 'Zoom out')} onClick={() => onZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))}>
          <IconZoomOut />
        </Button>
        <button type="button" className="w-12 text-center text-xs text-muted-foreground" onClick={() => onZoom(1)}>
          {Math.round(zoom * 100)}%
        </button>
        <Button size="icon" variant="ghost" className="size-7" aria-label={t('zoom-in', 'Zoom in')} onClick={() => onZoom(Math.min(1.5, Math.round((zoom + 0.1) * 10) / 10))}>
          <IconZoomIn />
        </Button>
      </div>
    </div>
  );
};
