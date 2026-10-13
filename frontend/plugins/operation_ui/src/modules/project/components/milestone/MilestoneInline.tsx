import { useMilestones } from '@/project/hooks/useMilestones';
import { IMilestone } from '@/project/types';
import { cn } from 'erxes-ui';
import { forwardRef } from 'react';
import { useParams } from 'react-router-dom';

export const MilestoneInline = forwardRef<
  HTMLDivElement,
  {
    milestoneId: string | null | undefined;
    milestone?: IMilestone;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ milestoneId, milestone, className, ...props }, ref) => {
  const { projectId } = useParams<{ projectId: string }>();

  const { milestones } = useMilestones(projectId, {
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
