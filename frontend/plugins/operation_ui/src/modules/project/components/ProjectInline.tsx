import { useProjects } from '@/project/hooks/useGetProjects';
import { IProject } from '@/project/types';
import { cn } from 'erxes-ui';
import { forwardRef } from 'react';

export const ProjectInline = forwardRef<
  HTMLDivElement,
  {
    project?: IProject;
    projectId: string;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ project, projectId, className, ...props }, ref) => {
  const { projects } = useProjects({
    skip: Boolean(project),
  });

  const name =
    projects?.find((project) => project._id === projectId)?.name ||
    project?.name;

  return (
    <div
      ref={ref}
      className={cn('inline-flex gap-1 items-center font-medium', className)}
      {...props}
    >
      {name || 'No Project'}
    </div>
  );
});

ProjectInline.displayName = 'ProjectInline';
