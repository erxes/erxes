import type { LeadStage } from '@erxes/core-contract';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { cn, DropdownMenu } from 'erxes-ui';

/** A stage as a coloured dot and its name. */
export const LeadStageBadge = ({ stage, className }: { stage?: Pick<LeadStage, 'name' | 'color'> | null; className?: string }) => (
  <span className={cn('inline-flex min-w-0 items-center gap-1.5 text-sm', className)}>
    <span className="size-2 shrink-0 rounded-full" style={{ background: stage?.color ?? 'var(--muted-foreground)' }} />
    <span className="truncate">{stage?.name ?? 'No stage'}</span>
  </span>
);

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
  children: React.ReactNode;
  align?: 'start' | 'end';
}) => (
  <DropdownMenu>
    <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
    <DropdownMenu.Content align={align} className="min-w-48">
      {stages.map((stage, index) => (
        <div key={stage.id}>
          {index > 0 && stages[index - 1]!.kind !== stage.kind && <DropdownMenu.Separator />}
          <DropdownMenu.Item onSelect={() => stage.id !== value && onSelect(stage)}>
            <LeadStageBadge stage={stage} className="flex-1" />
            {stage.id === value && <IconCheck className="size-4 text-primary" />}
          </DropdownMenu.Item>
        </div>
      ))}
    </DropdownMenu.Content>
  </DropdownMenu>
);

export const LeadStageTrigger = ({ stage, ...props }: { stage?: LeadStage | null } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    className={cn('inline-flex h-7 max-w-full items-center gap-1 rounded-md px-2 hover:bg-muted', props.className)}
  >
    <LeadStageBadge stage={stage} />
    <IconChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
  </button>
);
