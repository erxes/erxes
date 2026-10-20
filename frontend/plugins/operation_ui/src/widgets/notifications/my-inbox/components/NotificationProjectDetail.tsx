import type { NotificationProjectDetailProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { ProjectFields } from '@/project/components/details/ProjectFields';
import { useGetProject } from '@/project/hooks/useGetProject';
import { IconInfoCircle } from '@tabler/icons-react';
import { Empty, Spinner } from 'erxes-ui';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationOpenButton } from '~/widgets/notifications/my-inbox/components/NotificationOpenButton';

export const NotificationProjectDetail = ({
  contentTypeId,
}: NotificationProjectDetailProps): ReactElement => {
  const { t } = useTranslation('operation');
  const { project, loading, error } = useGetProject(contentTypeId);

  if (loading && !project) {
    return <Spinner containerClassName="h-full" />;
  }

  if (error || !project) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <Empty>
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
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full w-full p-6 xl:max-w-3xl">
      <ProjectFields
        key={project._id}
        projectId={project._id}
        titleAction={
          <NotificationOpenButton
            to={`/operation/projects/${project._id}/overview`}
          >
            {t('open-project', 'Open project')}
          </NotificationOpenButton>
        }
      />
    </div>
  );
};
