import { IconAlertCircle, IconCloudExclamation } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DealPanelError = ({ error }: { error: Error }) => {
  const { t } = useTranslation('sales');

  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertCircle />
        </Empty.Media>
        <Empty.Title>{t('error')}</Empty.Title>
        <Empty.Description>{error.message}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const DealPanelNotFound = () => {
  const { t } = useTranslation('sales');

  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconCloudExclamation />
        </Empty.Media>
        <Empty.Title>{t('deal-not-found')}</Empty.Title>
        <Empty.Description>{t('no-deal-with-id')}</Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
