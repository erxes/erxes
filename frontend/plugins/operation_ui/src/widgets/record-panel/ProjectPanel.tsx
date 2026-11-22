import { ActivityList } from '@/activity/components/ActivityList';
import { ProjectProperties } from '@/project/components/details/ProjectProperties';
import { useGetProject } from '@/project/hooks/useGetProject';
import { IconInfoCircle } from '@tabler/icons-react';
import { Button, Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IRecordPanelProps } from 'ui-modules';
import { ProjectPanelActions } from './ProjectPanelActions';
import { ProjectPanelDetail } from './ProjectPanelDetail';
import { ProjectPanelNew } from './ProjectPanelNew';

// Loading failed or the project is gone; offers Retry after an error.
const ProjectPanelUnavailable = ({
  error,
  onRetry,
}: {
  error?: Error;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Empty role={error ? 'alert' : undefined} className="flex-1">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconInfoCircle />
        </Empty.Media>
        <Empty.Title>
          {error
            ? t('failed-to-load-project', 'Failed to load project')
            : t('project-not-found', 'Project not found')}
        </Empty.Title>
        <Empty.Description>
          {error?.message ||
            t(
              'project-no-longer-available',
              'This project may have been removed or is no longer available.',
            )}
        </Empty.Description>
      </Empty.Header>
      {error && (
        <Empty.Content>
          <Button variant="secondary" onClick={onRetry}>
            {t('retry', 'Retry')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};

export const ProjectPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('operation');
  const { project, loading, error, refetch } = useGetProject(
    view === 'new' || view === 'title' ? undefined : contentId,
  );

  if (view === 'new') return <ProjectPanelNew />;
  if (view === 'title') return t('project-details');
  if (view === 'actions')
    return project ? <ProjectPanelActions project={project} /> : null;
  if (loading && !project) return <Spinner containerClassName="py-12" />;
  if (!project)
    return (
      <ProjectPanelUnavailable
        error={error}
        onRetry={() => {
          void refetch().catch(() => undefined);
        }}
      />
    );
  if (view === 'properties') return <ProjectProperties project={project} />;
  if (view === 'activity')
    return (
      <ActivityList
        key={contentId}
        contentId={contentId}
        contentDetail={project}
        inPanel
      />
    );
  return <ProjectPanelDetail key={contentId} project={project} />;
};
