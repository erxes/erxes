import { cn } from 'erxes-ui';
import { ReactNode } from 'react';

type NodeFrameProps = {
  label: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

// The frame is `relative` so node handles land on its outer edge.
export const NodeFrame = ({
  label,
  actions,
  className,
  children,
}: NodeFrameProps) => (
  <div
    className={cn(
      'relative w-[288px] rounded-2xl border border-border/50 bg-[color-mix(in_oklab,var(--color-muted)_50%,var(--color-background))] p-1 transition-all duration-200',
      className,
    )}
  >
    <div className="flex h-7 items-center justify-between gap-2 px-3">
      <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {actions && (
        <div className="-mr-2 flex items-center text-muted-foreground [&_button]:size-6">
          {actions}
        </div>
      )}
    </div>
    <div className="rounded-xl border border-border/60 bg-background shadow-xs">
      {children}
    </div>
  </div>
);
