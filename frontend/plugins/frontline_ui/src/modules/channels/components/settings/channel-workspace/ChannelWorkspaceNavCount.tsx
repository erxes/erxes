import { cn } from 'erxes-ui';

export const ChannelWorkspaceNavCount = ({
  value,
  className,
}: {
  value?: number;
  className?: string;
}) => {
  if (value === undefined) return null;

  return (
    <span
      className={cn(
        'ml-auto shrink-0 text-xs font-normal tabular-nums text-muted-foreground',
        className,
      )}
    >
      {value}
    </span>
  );
};
