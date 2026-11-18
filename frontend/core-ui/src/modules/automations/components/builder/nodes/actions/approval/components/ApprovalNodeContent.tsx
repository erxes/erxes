import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { useTranslation } from 'react-i18next';
import { TApprovalConfigForm } from '../states/approvalConfigForm';

export const ApprovalNodeContent = ({
  config,
}: NodeContentComponentProps<TApprovalConfigForm>) => {
  const { t } = useTranslation('automations');

  if (!config?.summary) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('approval-not-configured', 'No approval configured')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p className="line-clamp-2">{config.summary}</p>
      <p className="text-muted-foreground">
        {t('approval-timeout', 'Wait for (hours)')}: {config.timeoutHours || 72}
      </p>
    </div>
  );
};
