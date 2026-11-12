import type { ReactNode } from 'react';
import {
  Badge,
  BadgeProps,
  Empty,
  RecordTableInlineCell,
  Tooltip,
} from 'erxes-ui';

export function DiscordStatusCell({
  variant,
  label,
  tooltip,
}: Readonly<{
  variant: BadgeProps['variant'];
  label: string;
  tooltip?: string | null;
}>) {
  const badge = (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  );

  return (
    <RecordTableInlineCell>
      {tooltip ? (
        <Tooltip.Provider>
          <Tooltip delayDuration={0}>
            <Tooltip.Trigger asChild>
              <span>{badge}</span>
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-80 whitespace-pre-wrap break-words">
              {tooltip}
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      ) : (
        badge
      )}
    </RecordTableInlineCell>
  );
}

export function DiscordEmptyState({
  icon,
  title,
  description,
  action,
}: Readonly<{
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <Empty className="h-full w-full rounded-lg bg-accent">
      <Empty.Header>
        <Empty.Media>
          <div className="flex aspect-square w-20 items-center justify-center rounded-sm border-2 border-dashed bg-muted text-muted-foreground">
            {icon}
          </div>
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
      {action ? <Empty.Content>{action}</Empty.Content> : null}
    </Empty>
  );
}
