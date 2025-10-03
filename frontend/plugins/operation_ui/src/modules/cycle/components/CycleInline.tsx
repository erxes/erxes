import { useGetCycle } from '@/cycle/hooks/useGetCycle';
import { cn } from 'erxes-ui';
import { forwardRef } from 'react';

export const CycleInline = forwardRef<
  HTMLDivElement,
  { cycleId: string } & React.HTMLAttributes<HTMLDivElement>
>(({ cycleId, className, ...props }, ref) => {
  const { cycleDetail } = useGetCycle(cycleId);

  return (
    <div
      ref={ref}
      className={cn('inline-flex gap-1 items-center font-medium', className)}
      {...props}
    >
      {cycleDetail?.name || 'No cycle'}
    </div>
  );
});

CycleInline.displayName = 'CycleInline';
