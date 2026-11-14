import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MemberDetailEmptyState = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconCloudExclamation />
          </Empty.Media>
          <Empty.Title>{t('member-not-found')}</Empty.Title>
          <Empty.Description>{t('member-not-found-description')}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

export const MemberDetailErrorState = ({ message }: { message: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
