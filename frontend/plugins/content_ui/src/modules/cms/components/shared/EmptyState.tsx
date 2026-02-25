import { Button } from 'erxes-ui';
import { cn } from 'erxes-ui/lib';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('h-full w-full  px-8 flex justify-center', className)}>
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="mb-6">
          {Icon && (
            <Icon size={64} className="text-muted-foreground mx-auto mb-4" />
          )}
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          {description ? (
            <p className="text-muted-foreground max-w-md">{description}</p>
          ) : null}
        </div>
        {children ? (
          children
        ) : actionLabel && onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null}
      </div>
    </div>
  );
}
