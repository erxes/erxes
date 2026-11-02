import { useGetCycleInline } from '@/cycle/hooks/useGetCycleInline';
import { cn } from 'erxes-ui';
import { forwardRef } from 'react';

export const CycleInline = forwardRef<
  HTMLDivElement,
  { cycleId: string | null | undefined } & React.HTMLAttributes<HTMLDivElement>
>(({ cycleId, className, ...props }, ref) => {
  const { cycle } = useGetCycleInline(cycleId);

  return (
    <div
      ref={ref}
      className={cn('inline-flex gap-1 items-center font-medium', className)}
      {...props}
    >
      {cycle?.name || 'No cycle'}
    </div>
  );
});

CycleInline.displayName = 'CycleInline';
