import { ProjectsSideWidget } from '@/project/components/details/ProjectsSideWidget';
import { AddTaskButton } from '@/task/components/add-task/AddTaskButton';
import { ProjectPageBreadcrumb } from '@/project/components/breadcumb/ProjectPageBreadcrumb';
import { Outlet, useParams } from 'react-router-dom';
import { Can, PageHeader } from 'ui-modules';

export const ProjectLayout = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) return null;

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <ProjectPageBreadcrumb />
        </PageHeader.Start>
        <PageHeader.End>
          <Can action="taskCreate">
            <AddTaskButton />
          </Can>
        </PageHeader.End>
      </PageHeader>
      <div className="flex overflow-hidden w-full h-full">
        <Outlet />
        <ProjectsSideWidget projectId={projectId} />
      </div>
    </>
  );
};
