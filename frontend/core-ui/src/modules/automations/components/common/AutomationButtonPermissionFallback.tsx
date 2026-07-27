import { IconLock } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationButtonPermissionFallback = () => {
  const { t } = useTranslation('automations');
  return (
    <Button variant="secondary" disabled>
      <IconLock />
      {t('no-permission', 'No permission')}
    </Button>
  );
};
