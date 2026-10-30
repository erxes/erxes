import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** Shown in place of a step's summary its config cannot be drawn from. */
export const NodeContentErrorState = () => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2 text-xs text-warning">
      <IconAlertTriangle className="size-4 shrink-0" />
      {t('node-content-unreadable')}
    </div>
  );
};
