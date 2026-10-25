import { IconBrain } from '@tabler/icons-react';
import { Combobox, Command, Popover } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

import type { IAgentsThinkingLevel } from '../hooks/useAgentsChat';

interface IThinkingOption {
  value: IAgentsThinkingLevel;
  label: string;
  description: string;
  /** Filled bars out of four. Off stays empty. */
  intensity: 0 | 1 | 2 | 3 | 4;
}

const THINKING_OPTIONS: IThinkingOption[] = [
  {
    value: 'off',
    label: 'Off',
    description: 'Fastest, no reasoning',
    intensity: 0,
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'A brief pass before answering',
    intensity: 1,
  },
  {
    value: 'low',
    label: 'Low',
    description: 'Light reasoning, still quick',
    intensity: 2,
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced depth and speed',
    intensity: 3,
  },
  {
    value: 'high',
    label: 'High',
    description: 'Deepest reasoning, slower',
    intensity: 4,
  },
];

const BRAIN_OPACITY: Record<IThinkingOption['intensity'], string> = {
  0: 'opacity-40',
  1: 'opacity-50',
  2: 'opacity-60',
  3: 'opacity-80',
  4: 'opacity-100',
};

const THINKING_BARS = [
  { id: 'thinking-bar-1', height: 'h-1.5' },
  { id: 'thinking-bar-2', height: 'h-2' },
  { id: 'thinking-bar-3', height: 'h-2.5' },
  { id: 'thinking-bar-4', height: 'h-3' },
] as const;

export interface IThinkingPickerProps {
  value: IAgentsThinkingLevel;
  onChange: (level: IAgentsThinkingLevel) => void;
  disabled?: boolean;
}

const ThinkingBars = ({ filled }: { filled: IThinkingOption['intensity'] }) => (
  <span className="flex h-3.5 shrink-0 items-end gap-0.5" aria-hidden="true">
    {THINKING_BARS.map((bar, index) => (
      <span
        key={bar.id}
        className={`w-0.5 rounded-full ${bar.height} ${
          index < filled ? 'bg-foreground' : 'bg-border'
        }`}
      />
    ))}
  </span>
);

/** Per-turn thinking depth; mapped to each provider's native option. */
export const ThinkingPicker = ({
  value,
  onChange,
  disabled = false,
}: IThinkingPickerProps) => {
  const [open, setOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const active =
    THINKING_OPTIONS.find((option) => option.value === value) ??
    THINKING_OPTIONS[THINKING_OPTIONS.length - 1];

  useEffect(() => {
    if (open) commandRef.current?.focus();
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!disabled) setOpen(next);
      }}
    >
      <Combobox.Trigger
        variant="ghost"
        className="h-8 w-auto shrink-0 gap-1.5 rounded-md px-2 text-[13px]"
        disabled={disabled}
        aria-label={`Thinking level: ${active.label}`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <IconBrain
            className={`size-3.5 shrink-0 ${BRAIN_OPACITY[active.intensity]}`}
            aria-hidden="true"
          />
          <ThinkingBars filled={active.intensity} />
          <span className="truncate">{active.label}</span>
        </span>
      </Combobox.Trigger>
      <Combobox.Content
        className="w-72 min-w-0 overflow-hidden rounded-lg"
        collisionPadding={12}
        aria-label="Thinking level"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          commandRef.current?.focus();
        }}
      >
        <Command
          ref={commandRef}
          label="Thinking level"
          shouldFilter={false}
          defaultValue={value}
        >
          <div className="px-4 pb-1 pt-3 text-[11px] font-medium text-muted-foreground">
            Thinking
          </div>
          <Command.List className="m-0 max-h-none p-1.5">
            {THINKING_OPTIONS.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                onSelect={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="h-auto items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] data-[selected=true]:bg-muted"
              >
                <ThinkingBars filled={option.intensity} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium leading-4">
                    {option.label}
                  </span>
                  <span className="block truncate text-[11px] font-normal leading-4 text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <Combobox.Check
                    checked={value === option.value}
                    className="ml-0 text-foreground"
                  />
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
