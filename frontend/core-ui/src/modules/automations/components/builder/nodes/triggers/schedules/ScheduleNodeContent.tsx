import { useTranslation } from 'react-i18next';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

interface ScheduleConfig {
  cron?: string;
  timezone?: string;
}

export const ScheduleNodeContent = ({
  config,
}: NodeContentComponentProps<ScheduleConfig>) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p className="font-mono text-foreground">
        {config?.cron || t('schedule-not-configured')}
      </p>
      <p>{config?.timezone || 'UTC'}</p>
    </div>
  );
};
