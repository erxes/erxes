import { Empty } from 'erxes-ui';
import { IconCloudExclamation } from '@tabler/icons-react';
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
          <Empty.Title>{t('member-not-found', 'Member not found')}</Empty.Title>
          <Empty.Description>
            {t(
              'member-not-found-description',
              'There seems to be no member with this ID.',
            )}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
