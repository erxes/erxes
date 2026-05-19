import { cn } from 'erxes-ui';

export const AutomationOutputVariableCard = ({
  title,
  path,
  token,
  badge,
  onClick,
  onDragStart,
}: {
  title: string;
  path: string;
  token: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cn(
        'rounded-md border bg-background px-3 py-2 active:cursor-grabbing',
        onClick ? 'cursor-pointer hover:border-primary/60' : 'cursor-grab',
      )}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={token}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-foreground">{title}</div>
        {badge}
      </div>
      <div className="mt-1 break-all font-mono text-xs text-muted-foreground">
        {path}
      </div>
    </div>
  );
};
