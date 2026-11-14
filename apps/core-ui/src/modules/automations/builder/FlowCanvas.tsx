import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import {
  IconBolt,
  IconCalendarEvent,
  IconClock,
  IconFlag,
  IconHandFinger,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Fragment, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLeadStages } from '~/modules/leads/useLeads';
import { BuilderContext } from './BuilderContext';
import { catalogIcon } from './catalogGroups';
import { armsOf, type ListAddress, STEP_TITLES, type StepType } from './flowModel';
import { describeStep } from './flowText';
import { Connector, LOOK, Node } from './FlowNode';
import type { FieldInfo } from './useAutomationFields';

const TRIGGER_ICONS = {
  event: IconBolt,
  schedule: IconClock,
  date: IconCalendarEvent,
  manual: IconHandFinger,
} as const;

interface FlowProps {
  actions: ActionInfo[];
  fields: FieldInfo[];
  selected: string | null;
  problems: Map<string, string[]>;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onAdd: (address: ListAddress, index: number, type: StepType) => void;
}

/** A horizontal rule joining the arms, from the first arm's middle to the last one's. */
const ArmRule = ({ at, count, edge }: { at: number; count: number; edge: 'top' | 'bottom' }) => (
  <div
    className={
      edge === 'top' ? 'absolute top-0 h-px bg-border' : 'absolute bottom-0 h-px bg-border'
    }
    style={{ left: at === 0 ? '50%' : 0, right: at === count - 1 ? '50%' : 0 }}
  />
);

/** A branching step's arms side by side, each a list of its own. */
const Arms = ({ step, flow }: { step: AutomationStep; flow: FlowProps }) => {
  const arms = armsOf(step);

  if (!arms.length) return null;

  return (
    <>
      <div className="h-5 w-px shrink-0 bg-border" />
      <div className="flex items-stretch">
        {arms.map((arm, at) => (
          <div key={arm.key} className="relative flex flex-col items-center px-4">
            <ArmRule at={at} count={arms.length} edge="top" />
            <div className="h-4 w-px shrink-0 bg-border" />
            <span className="relative z-10 rounded-full border bg-muted px-2.5 py-0.5 text-2xs font-medium text-muted-foreground">
              {arm.label}
            </span>
            <StepList steps={arm.steps} address={{ parentId: step.id, arm: arm.key }} flow={flow} />
            <div className="min-h-4 w-px flex-1 bg-border" />
            <ArmRule at={at} count={arms.length} edge="bottom" />
          </div>
        ))}
      </div>
    </>
  );
};

/** One step's card: its kind (or plugin), what it does, problems and recent runs. */
const StepNode = ({ step, flow }: { step: AutomationStep; flow: FlowProps }) => {
  const { t } = useTranslation('automations');
  const { events, stats, outputsBefore } = useContext(BuilderContext);
  const { stages } = useLeadStages();

  const { title, detail } = describeStep(step, {
    actions: flow.actions,
    events,
    fields: [...flow.fields, ...outputsBefore(step.id)],
    stages,
  });

  const action =
    step.type === 'action' ? flow.actions.find((item) => item.type === step.action) : undefined;

  const kind =
    step.type !== 'action'
      ? t(`step-type.${step.type}`, STEP_TITLES[step.type])
      : action && action.source !== 'core'
        ? action.source
        : t('step-type.action', 'Action');

  return (
    <Node
      kind={kind}
      icon={action ? catalogIcon(action) : LOOK[step.type].icon}
      tone={LOOK[step.type].tone}
      title={title}
      detail={detail}
      selected={flow.selected === step.id}
      problems={flow.problems.get(step.id)}
      stats={stats.get(step.id)}
      onSelect={() => flow.onSelect(step.id)}
    />
  );
};

/** One list of steps, top to bottom; branching steps open into side-by-side arms. */
const StepList = ({
  steps,
  address,
  flow,
  root,
}: {
  steps: AutomationStep[];
  address: ListAddress;
  flow: FlowProps;
  root?: boolean;
}) => {
  const { t } = useTranslation('automations');

  const add = (index: number) =>
    flow.disabled ? undefined : (type: StepType) => flow.onAdd(address, index, type);

  return (
    <div className="flex flex-col items-center">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          <Connector onAdd={add(index)} />
          <StepNode step={step} flow={flow} />
          <Arms step={step} flow={flow} />
        </Fragment>
      ))}
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

const ZoomControls = ({ zoom, onZoom }: { zoom: number; onZoom: (zoom: number) => void }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-1 rounded-lg border bg-background p-1 shadow-xs">
      <Button
        size="icon"
        variant="ghost"
        className="size-7"
        aria-label={t('zoom-out', 'Zoom out')}
        onClick={() => onZoom(Math.max(0.5, Math.round((zoom - 0.1) * 10) / 10))}
      >
        <IconZoomOut />
      </Button>
      <button
        type="button"
        className="w-12 text-center text-xs text-muted-foreground"
        onClick={() => onZoom(1)}
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button
        size="icon"
        variant="ghost"
        className="size-7"
        aria-label={t('zoom-in', 'Zoom in')}
        onClick={() => onZoom(Math.min(1.5, Math.round((zoom + 0.1) * 10) / 10))}
      >
        <IconZoomIn />
      </Button>
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
  trigger: {
    kind: keyof typeof TRIGGER_ICONS;
    title: string;
    detail: string | null;
    problems?: string[];
  };
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
        // A pointer shortcut for Escape (the editor's key for leaving a step).
        role="presentation"
        // Only clicks on the empty canvas (menus are portals: their clicks bubble here through React).
        onClick={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest('[data-canvas-empty]'))
            onDeselect();
        }}
        data-canvas-empty
        style={{
          backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      >
        <div
          className="flex min-w-max justify-center px-10 py-8"
          style={{ zoom }}
          data-canvas-empty
        >
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
      <ZoomControls zoom={zoom} onZoom={onZoom} />
    </div>
  );
};
