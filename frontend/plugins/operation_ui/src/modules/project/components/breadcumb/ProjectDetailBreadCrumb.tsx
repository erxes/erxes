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

export const ProjectDetailBreadCrumb = () => {
  const { t } = useTranslation('operation');
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
            <Link to={`${basePath}/overview`}>{t('overview')}</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item value={`${basePath}/tasks`} asChild>
            <Link to={`${basePath}/tasks`}>{t('tasks')}</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
