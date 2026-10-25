import { IconBrain } from '@tabler/icons-react';
import { Combobox, Command, Popover } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

import type { IAgentsThinkingLevel } from '../hooks/useAgentsChat';
import {
  clampThinkingLevel,
  thinkingLevelsFor,
  type IAgentsModelThinking,
} from '../utils/thinkingLevels';

type IIntensity = 0 | 1 | 2 | 3 | 4;

interface IThinkingOption {
  value: IAgentsThinkingLevel;
  label: string;
  description: string;
  /** Filled bars out of four. Off stays empty. */
  intensity: IIntensity;
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
  {
    value: 'xhigh',
    label: 'Extra high',
    description: 'Even deeper reasoning, slower still',
    intensity: 4,
  },
  {
    value: 'max',
    label: 'Max',
    description: 'Deepest reasoning, slowest',
    intensity: 4,
  },
];

const TOGGLE_ON: Pick<IThinkingOption, 'label' | 'description'> = {
  label: 'On',
  description: 'Reason before answering',
};

/**
 * The options a model offers. Bars spread over its own depth range, so the
 * deepest offered level always fills all four; the original five levels keep
 * their original fill.
 */
const optionsFor = (
  thinking: IAgentsModelThinking | null,
): IThinkingOption[] => {
  const levels = thinkingLevelsFor(thinking);
  const deep = levels.filter((level) => level !== 'off');

  return THINKING_OPTIONS.filter((option) => levels.includes(option.value)).map(
    (option) => {
      const rank = deep.indexOf(option.value) + 1;
      const intensity = (
        rank === 0 ? 0 : Math.max(1, Math.round((rank * 4) / deep.length))
      ) as IIntensity;

      return {
        ...option,
        // High is only "deepest" when nothing deeper is offered.
        ...(option.value === 'high' && deep[deep.length - 1] !== 'high'
          ? { description: 'Deep reasoning, slower' }
          : {}),
        ...(thinking?.kind === 'toggle' && option.value !== 'off'
          ? TOGGLE_ON
          : {}),
        intensity,
      };
    },
  );
};

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
  /**
   * The selected model's thinking control. Null or absent (no catalog data)
   * offers the original five levels.
   */
  thinking?: IAgentsModelThinking | null;
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
  thinking = null,
}: IThinkingPickerProps) => {
  const [open, setOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const options = optionsFor(thinking);
  // Models that always reason (fixed) or never do (none) offer no choice.
  const fixedLabel =
    options.length > 0 ? null : thinking?.kind === 'none' ? 'Off' : 'Auto';
  const shown = clampThinkingLevel(
    value,
    options.map((option) => option.value),
  );
  const active: IThinkingOption = fixedLabel
    ? {
        value: shown,
        label: fixedLabel,
        description: '',
        intensity: thinking?.kind === 'none' ? 0 : 4,
      }
    : options.find((option) => option.value === shown) ??
      options[options.length - 1];
  const locked = disabled || Boolean(fixedLabel);

  useEffect(() => {
    if (open) commandRef.current?.focus();
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!locked) setOpen(next);
      }}
    >
      <Combobox.Trigger
        variant="ghost"
        className="h-8 w-auto shrink-0 gap-1.5 rounded-md px-2 text-[13px]"
        disabled={locked}
        aria-label={`Thinking level: ${active.label}`}
        title={
          fixedLabel === 'Off'
            ? "This model doesn't reason"
            : fixedLabel
            ? 'This model sets its own reasoning depth'
            : undefined
        }
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
          defaultValue={shown}
        >
          <div className="px-4 pb-1 pt-3 text-[11px] font-medium text-muted-foreground">
            Thinking
          </div>
          <Command.List className="m-0 max-h-none p-1.5">
            {options.map((option) => (
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
                    checked={shown === option.value}
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
