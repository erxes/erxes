import { cn } from 'erxes-ui';

export const TagDot = ({ color, className }: { color?: string | null; className?: string }) => (
  <span
    aria-hidden
    className={cn('inline-block size-2 shrink-0 rounded-full bg-muted-foreground', className)}
    style={color ? { backgroundColor: color } : undefined}
  />
);
