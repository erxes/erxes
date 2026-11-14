import type { TablerIcon } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useId } from 'react';

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
}) => {
  const name = useId();

  return (
    <fieldset
      aria-label={label}
      disabled={disabled}
      className={cn('flex min-w-0 rounded-md bg-muted p-0.5', className)}
    >
      {options.map((option) => {
        const on = option.value === value;

        return (
          <label
            key={option.value}
            className={cn(
              'flex h-7 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded px-2 text-xs text-muted-foreground transition-colors hover:text-foreground has-[:disabled]:pointer-events-none has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
              on && 'bg-background font-medium text-foreground shadow-xs',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={on}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon && <option.icon className="size-3.5 shrink-0" />}
            <span className="truncate">{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
};
