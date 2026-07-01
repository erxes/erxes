import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useUserDetail } from '../../hooks/useUserDetail';

export const MemberDetailErrorState = () => {
  const { t } = useTranslation('settings');
  const { error } = useUserDetail();
  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('properties.error', 'Error')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};
