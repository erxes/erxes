import { useMilestones } from '@/project/hooks/useMilestones';
import { IMilestone } from '@/project/types';
import { cn } from 'erxes-ui';
import { forwardRef } from 'react';

export const MilestoneInline = forwardRef<
  HTMLDivElement,
  {
    milestoneId: string;
    milestone?: IMilestone;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ milestoneId, milestone, className, ...props }, ref) => {
  const { milestones } = useMilestones({
    skip: Boolean(milestone),
  });

  const name =
    milestones?.find((milestone: IMilestone) => milestone._id === milestoneId)
      ?.name || milestone?.name;

  return (
    <div
      ref={ref}
      className={cn('inline-flex gap-1 items-center font-medium', className)}
      {...props}
    >
      {name || 'No Milestone'}
    </div>
  );
});
