import { IconCheck } from '@tabler/icons-react';
import { cn } from 'erxes-ui';

export const RobotsOption = ({
  checked,
  title,
  description,
  onClick,
}: {
  checked: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    onClick={onClick}
    className={cn(
      'flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-left transition-colors',
      checked && 'border-primary bg-primary/10',
    )}
  >
    <span
      className={cn(
        'mt-0.5 flex size-4 items-center justify-center rounded border text-transparent',
        checked
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background',
      )}
    >
      <IconCheck className="size-3" />
    </span>
    <span>
      <span className="block text-sm font-semibold">{title}</span>
      <span className="block text-xs text-muted-foreground">{description}</span>
    </span>
  </button>
);
