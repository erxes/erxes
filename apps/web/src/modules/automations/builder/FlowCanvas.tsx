import type { ActionInfo, AutomationStep } from '@erxes/core-contract';
import { IconChevronDown, IconChevronUp, IconFlag } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { Fragment, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext } from './BuilderContext';
import { countSteps } from './flowChecks';
import { foldedAtStart } from './flowFold';
import { armsOf, findStep, type ListAddress, type StepType } from './flowModel';
import { Connector, LINE, LINE_BORDER, Node } from './FlowNode';
import { LOOK, useStepLook } from './stepLook';
import { StepMenu } from './StepMenu';
import { useCanvasView } from './useCanvasView';
import { ZoomControls } from './ZoomControls';
import { TRIGGER_ICONS } from '../TemplatePicker';

interface FlowProps {
  actions: ActionInfo[];
  selected: string | null;
  problems: Map<string, string[]>;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onAdd: (address: ListAddress, index: number, type: StepType, action?: string) => void;
  onSteps: (steps: AutomationStep[]) => void;
}

type Flow = FlowProps & {
  all: AutomationStep[];
  folded: Set<string>;
  onFold: (id: string, fold: boolean) => void;
};

/**
 * Where an arm meets the line its parent splits into (top) or joins back from (bottom): the
 * outer arms bend in with a rounded corner, the middle ones cross it straight.
 */
const Elbow = ({ at, count, edge }: { at: number; count: number; edge: 'top' | 'bottom' }) => {
  const first = at === 0;
  const last = at === count - 1;

  if (!first && !last)
    return (
      <>
        <div
          className={cn('absolute inset-x-0 h-px', LINE, edge === 'top' ? 'top-0' : 'bottom-0')}
        />
        <div className={cn('absolute inset-y-0 left-1/2 w-px -translate-x-1/2', LINE)} />
      </>
    );

  return (
    <div
      className={cn(
        'absolute inset-y-0 w-1/2',
        LINE_BORDER,
        first ? 'right-0 border-l' : 'left-0 border-r',
        edge === 'top' ? 'border-t' : 'border-b',
        edge === 'top' && (first ? 'rounded-tl-xl' : 'rounded-tr-xl'),
        edge === 'bottom' && (first ? 'rounded-bl-xl' : 'rounded-br-xl'),
      )}
    />
  );
};

const FOLD_BUTTON =
  'relative z-10 flex items-center justify-center rounded-full border bg-background text-muted-foreground shadow-xs hover:border-foreground/20 hover:text-foreground';

/** A folded step's arms as one pill: how many paths and steps; clicking it opens them. */
const FoldedArms = ({
  paths,
  steps,
  onOpen,
}: {
  paths: number;
  steps: number;
  onOpen: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <>
      <div className={cn('h-5 w-px shrink-0', LINE)} />
      <button
        type="button"
        className={cn(FOLD_BUTTON, 'gap-1 px-2.5 py-0.5 text-2xs font-medium')}
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        <IconChevronDown className="size-3" />
        {t('n-paths', '{{count}} paths', { count: paths })} ·{' '}
        {t('n-steps', '{{count}} steps', { count: steps })}
      </button>
    </>
  );
};

/** A branching step's arms side by side, each a list of its own, or folded into one pill. */
const Arms = ({ step, flow }: { step: AutomationStep; flow: Flow }) => {
  const { t } = useTranslation('automations');
  const arms = armsOf(step);
  const { selected } = flow;

  if (!arms.length) return null;

  const holdsSelected =
    selected !== null && arms.some((arm) => findStep(arm.steps, selected) !== null);

  if (flow.folded.has(step.id) && !holdsSelected)
    return (
      <FoldedArms
        paths={arms.length}
        steps={countSteps(arms.flatMap((arm) => arm.steps))}
        onOpen={() => flow.onFold(step.id, false)}
      />
    );

  return (
    <>
      <div className="relative flex h-8 w-full shrink-0 items-center justify-center">
        <div className={cn('absolute inset-y-0 left-1/2 w-px -translate-x-1/2', LINE)} />
        <button
          type="button"
          className={cn(FOLD_BUTTON, 'size-5')}
          aria-label={t('fold-paths', 'Fold paths')}
          title={t('fold-paths', 'Fold paths')}
          onClick={(event) => {
            event.stopPropagation();
            flow.onFold(step.id, true);

            if (holdsSelected) flow.onSelect(step.id);
          }}
        >
          <IconChevronUp className="size-3" />
        </button>
      </div>
      <div className="flex items-stretch">
        {arms.map((arm, at) => (
          <div key={arm.key} className="flex flex-col items-center">
            <div className="relative h-5 w-full shrink-0">
              <Elbow at={at} count={arms.length} edge="top" />
            </div>
            <span className="relative z-10 -mt-px rounded-full border bg-background px-2.5 py-0.5 text-2xs font-medium text-muted-foreground shadow-xs">
              {arm.label}
            </span>
            <div className="px-5">
              <StepList
                steps={arm.steps}
                address={{ parentId: step.id, arm: arm.key }}
                flow={flow}
              />
            </div>
            <div className="relative min-h-5 w-full flex-1">
              <div className={cn('absolute top-0 bottom-5 left-1/2 w-px -translate-x-1/2', LINE)} />
              <div className="absolute inset-x-0 bottom-0 h-5">
                <Elbow at={at} count={arms.length} edge="bottom" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/** One step's card: its kind (or plugin), what it does, problems and recent runs. */
const StepNode = ({ step, flow }: { step: AutomationStep; flow: Flow }) => {
  const { stats } = useContext(BuilderContext);
  const look = useStepLook(step, flow.actions);

  return (
    <div data-step-id={step.id}>
      <Node
        {...look}
        selected={flow.selected === step.id}
        problems={flow.problems.get(step.id)}
        stats={stats.get(step.id)}
        menu={
          !flow.disabled && (
            <StepMenu
              step={step}
              steps={flow.all}
              onSteps={flow.onSteps}
              onSelect={flow.onSelect}
            />
          )
        }
        onSelect={() => flow.onSelect(step.id)}
      />
    </div>
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
  flow: Flow;
  root?: boolean;
}) => {
  const { t } = useTranslation('automations');

  const add = (index: number) =>
    flow.disabled
      ? undefined
      : {
          actions: flow.actions,
          onAdd: (type: StepType, action?: string) => flow.onAdd(address, index, type, action),
        };

  return (
    <div className="flex flex-col items-center">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          <Connector add={add(index)} arrow />
          <StepNode step={step} flow={flow} />
          <Arms step={step} flow={flow} />
        </Fragment>
      ))}
      <Connector add={add(steps.length)} arrow={root} height={root ? 'h-12' : 'h-10'} />
      {root && (
        <span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground shadow-xs">
          <IconFlag className="size-3.5" />
          {t('end', 'End')}
        </span>
      )}
    </div>
  );
};

/**
 * The automation as a flow: the trigger, then each step as a card, top to
 * bottom; branches, cases and A/B paths side by side, the deeper ones folded
 * when the flow would be too wide. "+" on any line adds a step there; a card
 * opens its settings in the inspector. Drag or scroll the empty canvas to move
 * around; pinch or ⌘/Ctrl + scroll to zoom.
 */
export const FlowCanvas = ({
  trigger,
  steps,
  onDeselect,
  ...props
}: FlowProps & {
  trigger: {
    kind: keyof typeof TRIGGER_ICONS;
    title: string;
    detail: string | null;
    problems?: string[];
  };
  steps: AutomationStep[];
  onDeselect: () => void;
}) => {
  const { t } = useTranslation('automations');

  const {
    box,
    flow: flowBox,
    zoom,
    zoomTo,
    fit,
    panning,
    handlers,
    wasDrag,
    keepInPlace,
  } = useCanvasView(props.selected);

  const [folded, setFolded] = useState(() => foldedAtStart(steps));

  const onFold = (id: string, fold: boolean) =>
    keepInPlace(id, () =>
      setFolded((current) => {
        const next = new Set(current);

        if (fold) next.add(id);
        else next.delete(id);

        return next;
      }),
    );

  const flow: Flow = { ...props, all: steps, folded, onFold };

  return (
    <div className="relative min-h-0 flex-1 bg-sidebar">
      <div
        ref={box}
        className={cn(
          'absolute inset-0 touch-none overflow-hidden select-none',
          panning ? 'cursor-grabbing' : 'cursor-grab',
        )}
        // A pointer shortcut for Escape (the editor's key for leaving a step).
        role="presentation"
        {...handlers}
        // Only clicks on the empty canvas (menus are portals: their clicks bubble here through React).
        onClick={(event) => {
          if (wasDrag()) return;

          if (event.target instanceof HTMLElement && event.target.closest('[data-canvas-empty]'))
            onDeselect();
        }}
        data-canvas-empty
      >
        <div className="canvas-world w-max" style={{ '--zoom': zoom }} data-canvas-empty>
          <div ref={flowBox} className="zoom flex flex-col items-center" data-canvas-empty>
            <Node
              kind={t('trigger-kind', 'When')}
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
      <ZoomControls zoom={zoom} onZoom={zoomTo} onFit={fit} />
    </div>
  );
};
