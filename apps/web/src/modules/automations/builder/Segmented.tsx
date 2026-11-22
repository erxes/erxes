import type { TablerIcon } from '@tabler/icons-react';
import { cn, ToggleGroup } from 'erxes-ui';

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
  label?: string;
}) => (
  <ToggleGroup
    variant="outline"
    value={[value]}
    disabled={disabled}
    aria-label={label}
    className={cn('w-full', className)}
    onValueChange={([next]) => {
      const picked = options.find((option) => option.value === next);

      if (picked) onChange(picked.value);
    }}
  >
    {options.map((option) => (
      <ToggleGroup.Item key={option.value} value={option.value} className="min-w-0 flex-1">
        {option.icon && <option.icon />}
        <span className="truncate">{option.label}</span>
      </ToggleGroup.Item>
    ))}
  </ToggleGroup>
);
