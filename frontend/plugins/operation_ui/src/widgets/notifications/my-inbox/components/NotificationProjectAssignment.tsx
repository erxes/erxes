import { useGetProject } from '@/project/hooks/useGetProject';
import { IconClipboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TNotification } from 'ui-modules';
import {
  AssignmentNotificationLayout,
  AssignmentUnavailable,
} from './AssignmentNotificationShared';

export const NotificationProjectAssignment = ({
  contentTypeId,
  title,
  fromUser,
  fromUserId,
  createdAt,
}: TNotification) => {
  const { t } = useTranslation('operation');
  const { project, loading, error } = useGetProject({
    variables: { _id: contentTypeId },
    skip: !contentTypeId,
  });

  const isAssigned = title === 'Project Assigned';
  const action = isAssigned ? t('assigned-you-to') : t('changed-status-on');

  if (!loading && !project) {
    return (
      <AssignmentUnavailable
        title={
          error
            ? t('failed-to-load-project', 'Failed to load project')
            : t('project-not-found', 'Project not found')
        }
        description={
          error?.message ||
          t(
            'project-no-longer-available',
            'This project may have been removed or is no longer available.',
          )
        }
      />
    );
  }

  return (
    <AssignmentNotificationLayout
      icon={
        <IconClipboard
          size={64}
          className="text-accent-foreground"
          stroke={1}
        />
      }
      kindLabel={t('project')}
      action={action}
      entityName={project?.name || t('a-project')}
      loading={loading}
      createdAt={createdAt}
      openTo={
        project ? `/operation/projects/${contentTypeId}/overview` : undefined
      }
      openLabel={t('open-project', 'Open project')}
      fromUser={fromUser}
      fromUserId={fromUserId}
    />
  );
};
