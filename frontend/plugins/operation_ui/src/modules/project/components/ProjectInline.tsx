import { useGetProject } from '@/project/hooks/useGetProject';
import { IProject } from '@/project/types';
import { cn, Spinner } from 'erxes-ui';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

export const ProjectInline = forwardRef<
  HTMLDivElement,
  {
    project?: IProject;
    projectId: string | null | undefined;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ project, projectId, className, ...props }, ref) => {
  const { t } = useTranslation('operation');
  const { project: projectDetail, loading } = useGetProject(projectId, {
    skip: Boolean(project),
  });

  const name = project?.name || projectDetail?.name;

  return (
    <div
      ref={ref}
      className={cn('inline-flex gap-1 items-center font-medium', className)}
      {...props}
    >
      {name ||
        (loading ? (
          <Spinner className="size-4" />
        ) : (
          t(projectId ? 'no-project-found' : 'no-project')
        ))}
    </div>
  );
});

ProjectInline.displayName = 'ProjectInline';
