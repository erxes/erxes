import { ActivityList } from '@/activity/components/ActivityList';
import { ProjectProperties } from '@/project/components/details/ProjectProperties';
import { useGetProject } from '@/project/hooks/useGetProject';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { IProjectDetail } from '@/project/types';
import { IconInfoCircle } from '@tabler/icons-react';
import { Button, Empty, Skeleton, Spinner, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IRecordPanelProps } from 'ui-modules';
import { ProjectPanelActions } from './ProjectPanelActions';
import { ProjectPanelDetail } from './ProjectPanelDetail';
import { ProjectPanelNew } from './ProjectPanelNew';

export const ProjectPanelTitle = ({ project }: { project: IProjectDetail }) => {
  const { t } = useTranslation('operation');
  const { updateProject } = useUpdateProject();
  return (
    <TextField
      scope={`side-panel-project.${project._id}.name`}
      value={project.name || ''}
      placeholder={t('project-name')}
      className="rounded-sm px-1 font-medium shadow-none"
      onSave={(name) =>
        name.trim() &&
        updateProject({ variables: { _id: project._id, name: name.trim() } })
      }
    />
  );
};

export const ProjectPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('operation');
  const { project, loading, error, refetch } = useGetProject(
    view === 'new' ? undefined : contentId,
  );

  if (view === 'new') return <ProjectPanelNew />;

  if (view === 'title') {
    if (loading && !project) return <Skeleton className="h-4 w-32" />;
    if (!project) return t('project', 'Project');
    return <ProjectPanelTitle project={project} />;
  }

  if (view === 'actions')
    return project ? <ProjectPanelActions project={project} /> : null;
  if (loading && !project) return <Spinner containerClassName="py-12" />;
  if (!project) {
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
            <Button
              variant="secondary"
              onClick={() => {
                void refetch().catch(() => undefined);
              }}
            >
              {t('retry', 'Retry')}
            </Button>
          </Empty.Content>
        )}
      </Empty>
    );
  }

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
