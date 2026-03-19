import { Outlet } from 'react-router-dom';
import { ProjectDetailBreadCrumb } from '@/project/components/breadcumb/ProjectDetailBreadCrumb';
import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';

import { ProjectBreadCrumb } from '@/project/components/breadcumb/ProjectBreadCrumb';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { AddTaskSheet } from '@/task/components/add-task/AddTaskSheet';
import { ProjectsSideWidget } from '@/project/components/details/ProjectsSideWidget';

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
          <AddTaskSheet />
        </PageHeader.End>
      </PageHeader>
      <div className="flex overflow-hidden w-full h-full">
        <Outlet />
        <ProjectsSideWidget projectId={projectId || ''} />
      </div>
    </>
  );
};
