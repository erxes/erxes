import { createComponentImplementation } from '@erxes/assistant-catalog/react';
import { CalloutApi, FlowApi, SuggestionsApi } from '@erxes/assistant-catalog';
import {
  IconAlertTriangle,
  IconArrowsSplit,
  IconBolt,
  IconCircleCheck,
  IconClockHour4,
  IconCornerDownRight,
  IconInfoCircle,
  IconPlayerPlay,
  IconX,
  type Icon,
} from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useUiHost } from '../host';
import { numbered } from './children';
import { CellText } from './data';
import { optionalText, textOf } from './values';

const CALLOUT_TONES = {
  info: { icon: IconInfoCircle, className: 'text-(--info-text) bg-(--info)/10' },
  good: { icon: IconCircleCheck, className: 'text-(--success-text) bg-(--success)/10' },
  warning: { icon: IconAlertTriangle, className: 'text-warning bg-(--warning)/15' },
  bad: { icon: IconX, className: 'text-destructive-text bg-(--destructive)/15' },
} as const;

export const Callout = createComponentImplementation(CalloutApi, ({ props, buildChild }) => {
  const tone = CALLOUT_TONES[props.tone ?? 'info'];
  const text = optionalText(props.text);

  return (
    <div role="note" className="flex min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2">
      <span className={cn('grid size-6 shrink-0 place-items-center rounded-md', tone.className)}>
        <tone.icon aria-hidden className="size-3.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{textOf(props.title)}</span>
        {text && <span className="text-xs text-muted-foreground">{text}</span>}
      </div>
      {props.action && <div className="shrink-0">{buildChild(props.action)}</div>}
    </div>
  );
});

const STEP_ICONS: Record<'trigger' | 'if' | 'action' | 'wait', Icon> = {
  trigger: IconPlayerPlay,
  if: IconArrowsSplit,
  action: IconBolt,
  wait: IconClockHour4,
};

type FlowStep = { kind: keyof typeof STEP_ICONS; text: string };

const Steps = ({ steps }: { steps: readonly FlowStep[] }) => (
  <ol className="flex min-w-0 flex-col">
    {numbered(steps).map(({ item: step, at }) => {
      const StepIcon = STEP_ICONS[step.kind];

      return (
        <li
          key={at}
          className="relative flex min-w-0 items-start gap-2.5 pb-3 last:pb-0 before:absolute before:top-6 before:bottom-0 before:left-3 before:w-px before:bg-border last:before:hidden"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md border bg-background">
            <StepIcon aria-hidden className="size-3.5 text-muted-foreground" />
          </span>
          <span className="min-w-0 pt-0.5 text-sm">
            <CellText text={step.text} />
          </span>
        </li>
      );
    })}
  </ol>
);

export const Suggestions = createComponentImplementation(SuggestionsApi, ({ props }) => {
  const host = useUiHost();

  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {numbered(props.items).map(({ item, at }) => (
        <Button
          key={at}
          variant="outline"
          size="sm"
          disabled={!host.live}
          onClick={() => host.ask(item)}
        >
          <IconCornerDownRight aria-hidden className="text-muted-foreground" />
          {item}
        </Button>
      ))}
    </div>
  );
});

export const Flow = createComponentImplementation(FlowApi, ({ props }) => (
  <div className="@container flex min-w-0 flex-col gap-3 rounded-lg border bg-background p-3">
    {props.title && <span className="text-sm font-medium">{props.title}</span>}
    <Steps steps={props.steps} />
    {props.branches && props.branches.length > 0 && (
      <div className="grid gap-2 @md:grid-cols-2">
        {numbered(props.branches).map(({ item: branch, at }) => (
          <div
            key={at}
            className="flex min-w-0 flex-col gap-2 rounded-md border border-dashed p-2.5"
          >
            <span className="self-start rounded bg-muted px-1.5 text-xs text-muted-foreground">
              {branch.label}
            </span>
            <Steps steps={branch.steps} />
          </div>
        ))}
      </div>
    )}
  </div>
));
