import type { TablerIcon } from '@tabler/icons-react';
import { cn } from 'erxes-ui';

/** A few mutually exclusive choices side by side (before / on / after, customers / companies). */
export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  disabled,
  className,
  label,
}: {
  value: T;
  options: { value: T; label: string; icon?: TablerIcon }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  /** For screen readers, when no visible label names the group. */
  label?: string;
}) => (
  <div role="radiogroup" aria-label={label} className={cn('flex rounded-md bg-muted p-0.5', className)}>
    {options.map((option) => {
      const on = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={on}
          disabled={disabled}
          onClick={() => !on && onChange(option.value)}
          className={cn(
            'flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 rounded px-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60',
            on && 'bg-background font-medium text-foreground shadow-xs',
          )}
        >
          {option.icon && <option.icon className="size-3.5 shrink-0" />}
          <span className="truncate">{option.label}</span>
        </button>
      );
    })}
  </div>
);
