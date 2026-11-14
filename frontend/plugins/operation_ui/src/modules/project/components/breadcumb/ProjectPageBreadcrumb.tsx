import { ProjectBreadCrumb } from './ProjectBreadCrumb';
import { ProjectDetailBreadCrumb } from './ProjectDetailBreadCrumb';
import { TeamBreadCrumb } from '@/team/components/breadcrumb/TeamBreadCrumb';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';

export const ProjectPageBreadcrumb = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        {teamId ? (
          <>
            <TeamBreadCrumb />
            <Separator.Inline />
            <ProjectBreadCrumb link={`/operation/team/${teamId}/projects`} />
          </>
        ) : (
          <ProjectBreadCrumb link={`/operation/projects`} />
        )}
        <Separator.Inline />
        <ProjectDetailBreadCrumb />
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
