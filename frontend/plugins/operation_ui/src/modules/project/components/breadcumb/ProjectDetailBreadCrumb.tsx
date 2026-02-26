import {
  Breadcrumb,
  Button,
  IconComponent,
  Separator,
  Skeleton,
  ToggleGroup,
} from 'erxes-ui';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useGetProject } from '@/project/hooks/useGetProject';
import { FavoriteToggleIconButton } from 'ui-modules';

export const ProjectDetailBreadCrumb = () => {
  const { teamId, projectId } = useParams<{
    teamId?: string;
    projectId: string;
  }>();
  const { pathname } = useLocation();

  const { project, loading } = useGetProject({
    variables: { _id: projectId },
    skip: !projectId,
  });

  if (loading) {
    return <Skeleton className="w-12 h-lh" />;
  }

  // Determine base path
  const basePath = teamId
    ? `/operation/team/${teamId}/projects/${projectId}`
    : `/operation/projects/${projectId}`;

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={`${basePath}/overview`}>
              <IconComponent name={project?.icon} />
              {project?.name}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Separator.Inline />
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item value={`${basePath}/overview`} asChild>
            <Link to={`${basePath}/overview`}>Overview</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item value={`${basePath}/tasks`} asChild>
            <Link to={`${basePath}/tasks`}>Tasks</Link>
          </ToggleGroup.Item>
          <FavoriteToggleIconButton />
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
