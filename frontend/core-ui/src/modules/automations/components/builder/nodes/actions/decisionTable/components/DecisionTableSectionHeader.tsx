import { IconPlus } from '@tabler/icons-react';
import { Button, Label } from 'erxes-ui';

export const DecisionTableSectionHeader = ({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex flex-col gap-0.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </Label>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
    {actionLabel && onAction && (
      <Button type="button" variant="outline" onClick={onAction}>
        <IconPlus />
        {actionLabel}
      </Button>
    )}
  </div>
);
