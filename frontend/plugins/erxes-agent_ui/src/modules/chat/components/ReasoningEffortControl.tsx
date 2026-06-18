import { useState } from 'react';
import { IconBrain, IconCheck } from '@tabler/icons-react';
import { Button, Command, Popover, Tooltip } from 'erxes-ui';
import {
  ReasoningEffort,
  REASONING_EFFORT_OPTIONS,
} from '~/modules/chat/types';

const REASONING_PICKER_ITEMS: {
  value?: ReasoningEffort;
  label: string;
  hint: string;
}[] = [
  { value: undefined, label: 'Auto', hint: "Use the agent's default" },
  ...REASONING_EFFORT_OPTIONS,
];

// One selectable row in the reasoning-level picker (kept separate so the menu
// JSX tree stays shallow).
const ReasoningOption = ({
  label,
  hint,
  selected,
  onSelect,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Command.Item
    value={label}
    onSelect={onSelect}
    className="h-auto cursor-pointer items-start gap-2 rounded-lg px-2.5 py-2"
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span
        className={`text-sm leading-none ${
          selected ? 'font-medium text-foreground' : 'text-foreground/90'
        }`}
      >
        {label}
      </span>
      <span className="text-[11px] leading-snug text-muted-foreground">
        {hint}
      </span>
    </div>
    <IconCheck
      className={`mt-0.5 shrink-0 text-muted-foreground transition-opacity ${
        selected ? 'opacity-100' : 'opacity-0'
      }`}
    />
  </Command.Item>
);

/**
 * A deliberately low-key composer control: a ghost "brain" icon that opens a
 * small level picker. Hidden in plain sight — most users never touch it, power
 * users can dial reasoning up or down per conversation. The choice persists per
 * agent (localStorage) and is unset by default, leaving the agent's configured
 * behaviour untouched.
 */
export const ReasoningEffortControl = ({
  value,
  onChange,
  disabled,
}: {
  value?: ReasoningEffort;
  onChange: (effort?: ReasoningEffort) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const active = Boolean(value);
  const activeLabel = REASONING_EFFORT_OPTIONS.find(
    (o) => o.value === value,
  )?.label;

  // Apply a level and close the popover.
  const select = (effort?: ReasoningEffort) => {
    onChange(effort);
    setOpen(false);
  };

  // Extracted so the trigger's own element chain doesn't deepen the tree below.
  const trigger = (
    <Popover.Trigger asChild>
      <Button
        size="icon"
        variant="ghost"
        aria-label="Thinking level"
        disabled={disabled}
        className={`size-9 shrink-0 transition-colors hover:text-foreground ${
          active ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        <IconBrain className="size-4" />
      </Button>
    </Popover.Trigger>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
          <Tooltip.Content>
            {active ? `Thinking: ${activeLabel}` : 'Thinking level'}
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
      <Popover.Content
        align="start"
        sideOffset={8}
        className="w-60 overflow-hidden p-0"
      >
        <div className="px-3 pb-1.5 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
          Thinking level
        </div>
        <Command shouldFilter={false}>
          <Command.List className="px-1 pb-1">
            {REASONING_PICKER_ITEMS.map((opt) => (
              <ReasoningOption
                key={opt.value ?? 'auto'}
                label={opt.label}
                hint={opt.hint}
                selected={(opt.value ?? undefined) === (value ?? undefined)}
                onSelect={() => select(opt.value)}
              />
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
