import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { AddProjectSheet } from '@/project/components/add-project/AddProjectSheet';
import { useParams } from 'react-router-dom';
import { ProjectBreadCrumb } from '@/project/components/breadcumb/ProjectBreadCrumb';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { ProjectsRecordTable } from '@/project/components/ProjectsRecordTable';

export const ProjectsPage = () => {
  const { teamId } = useParams();

  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {teamId && (
                <>
                  <TeamBreadCrumb />
                  <Separator.Inline />
                </>
              )}
              <ProjectBreadCrumb
                link={
                  teamId
                    ? `/operation/team/${teamId}/projects`
                    : `/operation/projects`
                }
              />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <AddProjectSheet />
        </PageHeader.End>
      </PageHeader>

      <ProjectsRecordTable />
    </>
  );
};
