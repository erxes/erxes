import { ProjectBreadCrumb } from '@/project/components/breadcumb/ProjectBreadCrumb';
import { ProjectDetailBreadCrumb } from '@/project/components/breadcumb/ProjectDetailBreadCrumb';
import { ProjectsSideWidget } from '@/project/components/details/ProjectsSideWidget';
import { AddTaskSheet } from '@/task/components/add-task/AddTaskSheet';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { Breadcrumb, Separator } from 'erxes-ui';
import { Outlet, useParams } from 'react-router-dom';
import { Can, PageHeader } from 'ui-modules';

export const ProjectLayout = () => {
  const { teamId, projectId } = useParams<{
    teamId?: string;
    projectId: string;
  }>();

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {teamId ? (
                <>
                  <TeamBreadCrumb />
                  <Separator.Inline />
                  <ProjectBreadCrumb
                    link={`/operation/team/${teamId}/projects`}
                  />
                </>
              ) : (
                <ProjectBreadCrumb link={`/operation/projects`} />
              )}
              <Separator.Inline />
              <ProjectDetailBreadCrumb />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <Can action="taskCreate">
            <AddTaskSheet />
          </Can>
        </PageHeader.End>
      </PageHeader>
      <div className="flex overflow-hidden w-full h-full">
        <Outlet />
        <ProjectsSideWidget projectId={projectId || ''} />
      </div>
    </>
  );
};
