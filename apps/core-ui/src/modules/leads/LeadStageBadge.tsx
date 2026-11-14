import type { LeadStage } from '@erxes/core-contract';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { cn, DropdownMenu } from 'erxes-ui';
import { useLeadsT, useStageName } from './i18n';

/** A stage as a coloured dot and its name. */
export const LeadStageBadge = ({
  stage,
  className,
}: {
  stage?: Pick<LeadStage, 'name' | 'color'> | null;
  className?: string;
}) => {
  const t = useLeadsT();
  const stageName = useStageName();

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5 text-sm', className)}>
      <span
        className={cn(
          'size-2 shrink-0 rounded-full',
          stage ? 'bg-(--stage-color)' : 'bg-muted-foreground',
        )}
        style={{ '--stage-color': stage?.color }}
      />
      <span className="truncate">{stage ? stageName(stage.name) : t('no-stage')}</span>
    </span>
  );
};

/** Picks a stage (grouped open, then qualified, then disqualified, in the organisation's order). */
export const LeadStageMenu = ({
  stages,
  value,
  onSelect,
  children,
  align = 'start',
}: {
  stages: LeadStage[];
  value?: string | null;
  onSelect: (stage: LeadStage) => void;
  children: React.ReactElement;
  align?: 'start' | 'end';
}) => (
  <DropdownMenu>
    <DropdownMenu.Trigger render={children} />
    <DropdownMenu.Content align={align} className="min-w-48">
      {stages.map((stage, index) => (
        <div key={stage.id}>
          {index > 0 && stages[index - 1]?.kind !== stage.kind && <DropdownMenu.Separator />}
          <DropdownMenu.Item onClick={() => stage.id !== value && onSelect(stage)}>
            <LeadStageBadge stage={stage} className="flex-1" />
            {stage.id === value && <IconCheck className="size-4 text-primary-text" />}
          </DropdownMenu.Item>
        </div>
      ))}
    </DropdownMenu.Content>
  </DropdownMenu>
);

/** The stage as a status pill, tinted with its colour (inside a trigger of its own). */
export const LeadStagePill = ({ stage }: { stage?: LeadStage | null }) => (
  <span
    style={{ '--stage-color': stage?.color }}
    className={cn(
      'inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-transparent px-2 text-xs font-medium',
      stage ? 'bg-(--stage-color)/16' : 'border-dashed border-border text-muted-foreground',
    )}
  >
    <LeadStageBadge stage={stage} className="text-xs" />
    <IconChevronDown className="size-3 shrink-0 opacity-60" />
  </span>
);

/** The stage as a status pill button; click to change it. */
/**
 * The stage pill as a menu trigger. Forwards its ref: the menu measures the
 * button to sit under it (without it the menu opens at the window's corner).
 */
export const LeadStageTrigger = ({
  ref,
  stage,
  ...props
}: { stage?: LeadStage | null } & React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.RefAttributes<HTMLButtonElement>) => (
  <button
    ref={ref}
    type="button"
    {...props}
    style={{ '--stage-color': stage?.color, ...props.style }}
    className={cn(
      'inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-transparent px-2 text-xs font-medium transition hover:brightness-95 data-popup-open:border-border',
      stage ? 'bg-(--stage-color)/16' : 'border-dashed border-border text-muted-foreground',
      props.className,
    )}
  >
    <LeadStageBadge stage={stage} className="text-xs" />
    <IconChevronDown className="size-3 shrink-0 opacity-60" />
  </button>
);
