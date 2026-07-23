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
import { useTranslation } from 'react-i18next';
import { FavoriteToggleIconButton } from 'ui-modules';
import { useTeamFavoriteBreadcrumb } from '@/team/hooks/useTeamFavoriteBreadcrumb';

export const ProjectDetailBreadCrumb = () => {
  const { t } = useTranslation('operation');
  const { teamId, projectId } = useParams<{
    teamId?: string;
    projectId: string;
  }>();
  const { pathname } = useLocation();

  const { project, loading: projectLoading } = useGetProject({
    variables: { _id: projectId },
    skip: !projectId,
  });

  // Determine base path
  const basePath = teamId
    ? `/operation/team/${teamId}/projects/${projectId}`
    : `/operation/projects/${projectId}`;
  const projectSegment = projectId ? project?.name || 'Unknown' : undefined;
  const { breadcrumb: favoriteBreadcrumb, loading: teamLoading } =
    useTeamFavoriteBreadcrumb(
      teamId,
      teamId ? projectSegment : t('projects'),
      teamId ? undefined : projectSegment,
    );

  if (projectLoading || teamLoading) {
    return <Skeleton className="w-12 h-lh" />;
  }

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
            <Link to={`${basePath}/overview`}>{t('overview', 'Overview')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item value={`${basePath}/tasks`} asChild>
            <Link to={`${basePath}/tasks`}>{t('tasks', 'Tasks')}</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
        <Breadcrumb.Item className="ml-1">
          <FavoriteToggleIconButton
            breadcrumb={favoriteBreadcrumb}
            icon="IconClipboard"
          />
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
