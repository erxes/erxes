import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useTranslation } from 'react-i18next';
import { TSendNotificationConfigForm } from '../states/sendNotificationConfigForm';

export const SendNotificationNodeContent = ({
  config,
}: NodeContentComponentProps<TSendNotificationConfigForm>) => {
  const { t } = useTranslation('automations');

  if (!config?.title) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('notification-not-configured', 'No notification configured')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p className="font-medium truncate">{config.title}</p>
      {config.message ? (
        <p className="text-muted-foreground line-clamp-2">{config.message}</p>
      ) : null}
    </div>
  );
};
