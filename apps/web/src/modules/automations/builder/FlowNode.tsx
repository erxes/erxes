import type { ActionInfo } from '@erxes/core-contract';
import {
  IconAlertTriangle,
  IconCaretDownFilled,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';
import type { NodeIcon } from './stepLook';
import { type AddStep, StepPicker } from './StepPicker';

/** The canvas's lines: the vertical ones as fills, the elbows as borders. */
export const LINE = 'bg-muted-foreground/40';
export const LINE_BORDER = 'border-muted-foreground/40';

/** A vertical line, with a "+" in the middle when steps may be added here, and an arrow into the next card. */
export const Connector = ({
  add,
  arrow,
  height = 'h-12',
}: {
  add?: { actions: ActionInfo[]; onAdd: AddStep };
  arrow?: boolean;
  height?: string;
}) => (
  <div className={cn('relative flex w-full shrink-0 items-center justify-center', height)}>
    <div className={cn('absolute inset-y-0 left-1/2 w-px -translate-x-1/2', LINE)} />
    {arrow && (
      <IconCaretDownFilled className="absolute -bottom-1 left-1/2 size-3.5 -translate-x-1/2 text-muted-foreground/60" />
    )}
    {add && <StepPicker actions={add.actions} onAdd={add.onAdd} />}
  </div>
);

/** Runs of the last 30 days: succeeded, and failed when any. */
export const NodeStats = ({ stats }: { stats: { succeeded: number; failed: number } }) => (
  <>
    <span className="flex items-center gap-1">
      <IconCircleCheck className="size-3.5 text-success" />
      {stats.succeeded}
    </span>
    {stats.failed > 0 && (
      <span className="flex items-center gap-1 text-destructive-text">
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
  dot,
  title,
  detail,
  selected,
  problems,
  stats,
  menu,
  onSelect,
}: {
  kind: string;
  icon: NodeIcon;
  tone: string;
  dot: string;
  title: string;
  detail: string | null;
  selected: boolean;
  problems?: string[];
  stats?: { succeeded: number; failed: number };
  /** The step's "⋯", at the header's end. */
  menu?: ReactNode;
  onSelect: () => void;
}) => (
  <div className="relative z-10 w-72 shrink-0">
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      title={problems?.join('\n')}
      className={cn(
        'block w-full overflow-hidden rounded-xl border bg-background text-left shadow-sm transition',
        'hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        selected && 'border-primary ring-4 ring-primary/15',
        problems?.length && !selected && 'border-destructive/60',
      )}
    >
      <span className="flex h-7 items-center gap-1.5 border-b bg-muted/50 px-3 text-2xs font-medium text-muted-foreground">
        <span className={cn('size-1.5 rounded-full', dot)} />
        {kind}
        {!!problems?.length && (
          <IconAlertTriangle className="ml-auto size-3.5 text-destructive-text" />
        )}
      </span>
      <span className="flex items-center gap-3 p-3">
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', tone)}>
          <Icon className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 block text-sm font-medium break-words">{title}</span>
          {detail && <span className="block truncate text-xs text-muted-foreground">{detail}</span>}
        </span>
      </span>
      {stats && (
        <span className="flex items-center gap-3 border-t px-3 py-1.5 text-2xs text-muted-foreground">
          <NodeStats stats={stats} />
        </span>
      )}
    </button>
    {menu && (
      <span className={cn('absolute top-0.5 flex', problems?.length ? 'right-7' : 'right-1')}>
        {menu}
      </span>
    )}
    {selected && (
      <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rounded-full border-2 border-primary bg-background" />
    )}
  </div>
);
