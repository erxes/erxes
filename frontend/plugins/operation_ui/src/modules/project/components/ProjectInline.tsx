import { useGetProject } from '@/project/hooks/useGetProject';
import { IProject } from '@/project/types';
import { cn } from 'erxes-ui';
import { forwardRef } from 'react';

export const ProjectInline = forwardRef<
  HTMLDivElement,
  {
    project?: IProject;
    projectId: string | null | undefined;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ project, projectId, className, ...props }, ref) => {
  const { project: fetchedProject } = useGetProject(projectId, {
    skip: Boolean(project),
    subscribe: false,
  });

  const name = project?.name || fetchedProject?.name;

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
