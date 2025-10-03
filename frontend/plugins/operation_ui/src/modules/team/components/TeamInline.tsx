import { useGetTeams } from '@/team/hooks/useGetTeams';
import { cn, IconComponent } from 'erxes-ui';
import { forwardRef } from 'react';

export const TeamInline = forwardRef<
  HTMLDivElement,
  { teamId: string } & React.HTMLAttributes<HTMLDivElement>
>(({ teamId, className, ...props }, ref) => {
  const { teams } = useGetTeams();

  const team = teams?.find((team) => team._id === teamId);

  return (
    <div
      ref={ref}
      className={cn('inline-flex gap-1 items-center font-medium', className)}
      {...props}
    >
      <IconComponent name={team?.icon} className="size-4" />
      {team?.name}
    </div>
  );
});

TeamInline.displayName = 'TeamInline';
