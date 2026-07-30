import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useUserDetail } from '../../hooks/useUserDetail';
import { useTranslation } from 'react-i18next';

export const MemberDetailErrorState = () => {
  const { error } = useUserDetail();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error', 'Error')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
